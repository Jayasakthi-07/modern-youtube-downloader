# Backend - Modern YouTube Downloader

Production-ready Express.js backend with yt-dlp integration for robust YouTube video and audio downloading.

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **yt-dlp** installed and accessible in system PATH
  - Install via: `pip install yt-dlp` or download from [yt-dlp releases](https://github.com/yt-dlp/yt-dlp/releases)
- **ffmpeg** (optional, for format conversion and GIF generation)

## 🚀 Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Directory Configuration
TEMP_DIR=../temp
DOWNLOAD_DIR=../downloads

# Security Configuration
CORS_ORIGIN=*
MAX_CONCURRENT_DOWNLOADS=5

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Verify yt-dlp Installation

```bash
yt-dlp --version
```

### 4. Start the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000`

## 🛠️ Tech Stack

- **Express.js** - Web framework
- **yt-dlp** - YouTube video/audio extraction
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **express-rate-limit** - Rate limiting
- **compression** - Response compression
- **dotenv** - Environment variable management
- **uuid** - Unique download ID generation

## 📡 API Endpoints

### Health Check
```
GET /health
```
Returns server status, uptime, and environment info.

### Video Information
```
GET /api/video/info?url={youtube_url}
```
Fetch video metadata (title, duration, formats, thumbnails, etc.)

**Query Parameters:**
- `url` (required) - YouTube video URL

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Video Title",
    "duration": 240,
    "formats": [...],
    "thumbnail": "..."
  }
}
```

### Download Video
```
POST /api/download/video
```
Download video in specified quality and format.

**Request Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=...",
  "quality": "720p",
  "format": "mp4",
  "startTime": "00:10",
  "endTime": "01:30"
}
```

**Response:**
```json
{
  "success": true,
  "downloadId": "uuid-here",
  "downloadUrl": "/downloads/uuid-here.mp4"
}
```

### Download Audio
```
POST /api/download/audio
```
Extract and download audio only.

**Request Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=...",
  "format": "mp3",
  "quality": "192k"
}
```

### Download Playlist
```
POST /api/download/playlist
```
Download entire YouTube playlist.

**Request Body:**
```json
{
  "url": "https://www.youtube.com/playlist?list=...",
  "quality": "720p",
  "format": "mp4",
  "audioOnly": false
}
```

### Download Progress
```
GET /api/download/progress/:id
```
Track download progress in real-time.

**Response:**
```json
{
  "success": true,
  "progress": {
    "status": "downloading",
    "percent": 45.2,
    "speed": "2.5MiB/s",
    "eta": "00:15"
  }
}
```

### Validate URL
```
POST /api/validate/url
```
Validate YouTube URL format.

**Request Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=..."
}
```

### List Available Formats
```
GET /api/formats/:videoId
```
Get all available formats for a video.

## 🔧 Project Structure

```
backend/
├── routes/
│   └── downloader.js    # API route handlers
├── server.js            # Express server setup
├── package.json         # Dependencies
├── .env                 # Environment variables
└── README.md           # This file
```

## 🔐 Security Features

- **Helmet.js** - Sets security-related HTTP headers
- **CORS** - Configurable cross-origin resource sharing
- **Rate Limiting** - Prevents API abuse (100 requests per 15 minutes)
- **Input Validation** - URL validation for all endpoints
- **Error Handling** - Comprehensive error handling with proper status codes

## 📊 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `NODE_ENV` | development | Environment mode |
| `TEMP_DIR` | ../temp | Temporary files directory |
| `DOWNLOAD_DIR` | ../downloads | Downloaded files directory |
| `CORS_ORIGIN` | * | Allowed CORS origins |
| `MAX_CONCURRENT_DOWNLOADS` | 5 | Maximum concurrent downloads |
| `RATE_LIMIT_WINDOW` | 900000 | Rate limit window (ms) |
| `RATE_LIMIT_MAX_REQUESTS` | 100 | Max requests per window |

## 🐛 Troubleshooting

### yt-dlp not found
```bash
# Install yt-dlp globally
pip install -U yt-dlp

# Or use system package manager
sudo apt install yt-dlp  # Debian/Ubuntu
brew install yt-dlp      # macOS
```

### Port already in use
Change `PORT` in `.env` file or:
```bash
PORT=3001 npm start
```

### Download fails
- Ensure yt-dlp is up to date: `yt-dlp -U`
- Check video availability and region restrictions
- Verify network connectivity

## 📝 Development

### Run in development mode with auto-reload:
```bash
npm run dev
```

### Testing endpoints:
```bash
# Health check
curl http://localhost:3000/health

# Get video info
curl "http://localhost:3000/api/video/info?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ"
```

## 📄 License

MIT License - See LICENSE file for details

## 👤 Author

**Jayasakthi-07**

## 🙏 Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - YouTube download library
- [Express.js](https://expressjs.com/) - Web framework
- [Helmet.js](https://helmetjs.github.io/) - Security middleware
