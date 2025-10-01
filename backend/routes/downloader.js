/**
 * Downloader Routes - Modern YouTube Downloader
 *
 * Provides RESTful API endpoints for video/audio downloads, playlist handling,
 * format listing, URL validation, metadata info, progress tracking and GIF conversion.
 *
 * Uses yt-dlp via child_process for robust YouTube extraction. All operations
 * stream results to disk and expose download URLs via /downloads.
 */

const { Router } = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = Router();

// In-memory progress store (swap to Redis for distributed setups)
const progressMap = new Map();

// Utility: Build safe filename
function safeName(name) {
  return name.replace(/[\\/:*?"<>|]+/g, '_').slice(0, 140);
}

// Utility: Execute yt-dlp with args and track progress
function runYtDlp(args, outputPath, id) {
  return new Promise((resolve, reject) => {
    const child = spawn('yt-dlp', args);

    let stderr = '';
    progressMap.set(id, { status: 'starting', percent: 0, speed: null, eta: null });

    child.stdout.on('data', (data) => {
      const line = data.toString();
      // Parse progress lines like: [download]  12.3% of ... at 1.23MiB/s ETA 00:10
      const match = line.match(/\[download\]\s+(\d+\.\d+)%.*?\s(\d+\.\d+\w+\/s)\sETA\s([\d:]+)/);
      if (match) {
        progressMap.set(id, {
          status: 'downloading',
          percent: Number(match[1]),
          speed: match[2],
          eta: match[3],
        });
      }
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (err) => {
      progressMap.set(id, { status: 'error', error: err.message });
      reject(err);
    });

    child.on('close', (code) => {
      if (code === 0 && fs.existsSync(outputPath)) {
        progressMap.set(id, { status: 'completed', percent: 100 });
        resolve();
      } else {
        const error = new Error(stderr || `yt-dlp exited with code ${code}`);
        progressMap.set(id, { status: 'error', error: error.message });
        reject(error);
      }
    });
  });
}

// Resolve directories from env (same layout as server)
const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR || path.join(__dirname, '../../downloads');
const TEMP_DIR = process.env.TEMP_DIR || path.join(__dirname, '../../temp');

// Ensure directories exist
for (const dir of [DOWNLOAD_DIR, TEMP_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Validate URL basic pattern
function isValidYouTubeUrl(url) {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(url);
}

// GET /api/video/info?url=...
router.get('/video/info', async (req, res, next) => {
  try {
    const { url } = req.query;
    if (!url || !isValidYouTubeUrl(url)) {
      return res.status(400).json({ success: false, error: 'Invalid or missing YouTube URL' });
    }

    const args = ['-j', '--no-warnings', url];
    const child = spawn('yt-dlp', args);

    let json = '';
    let err = '';
    child.stdout.on('data', (d) => (json += d.toString()));
    child.stderr.on('data', (d) => (err += d.toString()));

    child.on('close', (code) => {
      if (code === 0) {
        try {
          return res.json({ success: true, data: JSON.parse(json) });
        } catch (e) {
          return res.status(500).json({ success: false, error: 'Failed to parse metadata' });
        }
      }
      return res.status(500).json({ success: false, error: err || `yt-dlp failed (${code})` });
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/download/video
router.post('/download/video', async (req, res, next) => {
  try {
    const { url, quality = '720p', format = 'mp4', startTime, endTime } = req.body || {};
    if (!url || !isValidYouTubeUrl(url)) {
      return res.status(400).json({ success: false, error: 'Invalid or missing YouTube URL' });
    }

    const id = uuidv4();
    const filename = `${id}.${format}`;
    const outputPath = path.join(DOWNLOAD_DIR, filename);

    // Build yt-dlp args
    const args = [
      url,
      '-f', `bestvideo[height<=${quality.replace(/p/i, '')}]+bestaudio/best[ext=${format}]`,
      '-o', outputPath,
      '--no-playlist',
    ];

    // Optional trim using ffmpeg postprocessor
    if (startTime || endTime) {
      args.push('--download-sections');
      const section = `${startTime || '0'}-${endTime || 'inf'}`;
      args.push(`*${section}`);
    }

    // Execute
    runYtDlp(args, outputPath, id)
      .then(() => {
        res.json({
          success: true,
          downloadId: id,
          downloadUrl: `/downloads/${filename}`,
        });
      })
      .catch((error) => next(error));
  } catch (error) {
    next(error);
  }
});

// POST /api/download/audio
router.post('/download/audio', async (req, res, next) => {
  try {
    const { url, format = 'mp3', quality = '192k' } = req.body || {};
    if (!url || !isValidYouTubeUrl(url)) {
      return res.status(400).json({ success: false, error: 'Invalid or missing YouTube URL' });
    }

    const id = uuidv4();
    const filename = `${id}.${format}`;
    const outputPath = path.join(DOWNLOAD_DIR, filename);

    const args = [
      url,
      '-x', '--audio-format', format,
      '--audio-quality', quality,
      '-o', outputPath,
      '--no-playlist',
    ];

    runYtDlp(args, outputPath, id)
      .then(() => {
        res.json({ success: true, downloadId: id, downloadUrl: `/downloads/${filename}` });
      })
      .catch((error) => next(error));
  } catch (error) {
    next(error);
  }
});

// POST /api/download/playlist
router.post('/download/playlist', async (req, res, next) => {
  try {
    const { url, quality = '720p', format = 'mp4', audioOnly = false } = req.body || {};
    if (!url || !isValidYouTubeUrl(url)) {
      return res.status(400).json({ success: false, error: 'Invalid or missing YouTube URL' });
    }

    const id = uuidv4();
    const folder = path.join(DOWNLOAD_DIR, id);
    fs.mkdirSync(folder, { recursive: true });

    const template = path.join(folder, '%(playlist_index)s-%(id)s.%(ext)s');

    const args = audioOnly
      ? [url, '-x', '--audio-format', format, '-o', template]
      : [
          url,
          '-f', `bestvideo[height<=${quality.replace(/p/i, '')}]+bestaudio/best[ext=${format}]`,
          '-o', template,
        ];

    runYtDlp(args, folder, id)
      .then(() => {
        res.json({ success: true, downloadId: id, downloadUrl: `/downloads/${id}/` });
      })
      .catch((error) => next(error));
  } catch (error) {
    next(error);
  }
});

// GET /api/download/progress/:id
router.get('/download/progress/:id', (req, res) => {
  const { id } = req.params;
  const p = progressMap.get(id);
  if (!p) return res.status(404).json({ success: false, error: 'Unknown download id' });
  res.json({ success: true, progress: p });
});

// POST /api/validate/url
router.post('/validate/url', (req, res) => {
  const { url } = req.body || {};
  const valid = !!url && isValidYouTubeUrl(url);
  res.json({ success: valid, valid });
});

// GET /api/formats/:videoId
router.get('/formats/:videoId', (req, res, next) => {
  const { videoId } = req.params;
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  const args = [url, '-F'];
  const child = spawn('yt-dlp', args);

  let out = '';
  let err = '';
  child.stdout.on('data', (d) => (out += d.toString()));
  child.stderr.on('data', (d) => (err += d.toString()));
  child.on('close', (code) => {
    if (code === 0) {
      return res.json({ success: true, formats: out });
    }
    return res.status(500).json({ success: false, error: err || `yt-dlp failed (${code})` });
  });
});

// POST /api/convert/gif
router.post('/convert/gif', (req, res) => {
  // Placeholder: Requires ffmpeg installed and a prior downloaded segment
  // Implement ffmpeg -i input -vf fps=10,scale=480:-1:flags=lanczos -t 3 output.gif
  return res.status(501).json({ success: false, error: 'GIF conversion not implemented yet' });
});

module.exports = router;
