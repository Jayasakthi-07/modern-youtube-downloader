# Frontend - Modern YouTube Downloader

Modern, responsive frontend for the YouTube downloader with a premium UI/UX design.

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🚀 Installation

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Environment Configuration

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_RECAPTCHA_SITE_KEY=your_site_key
REACT_APP_ENABLE_ANALYTICS=false
```

### 3. Start Development Server

```bash
npm start
# or
yarn start
```

The application will start on `http://localhost:3001`

### 4. Build for Production

```bash
npm run build
# or
yarn build
```

## 🛠️ Tech Stack

- **React.js** - Component-based UI library
- **CSS3** - Modern styling with custom properties
- **JavaScript ES6+** - Modern JavaScript features
- **Responsive Design** - Mobile-first approach
- **LocalStorage** - Client-side data persistence

## 📁 Project Structure

```
frontend/
├── public/
│   ├── index.html          # Main HTML template
│   └── favicon.ico         # Application icon
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── VideoCard.js    # Video preview card
│   │   ├── DownloadForm.js # Download form component
│   │   ├── ProgressBar.js  # Download progress indicator
│   │   └── ThemeToggle.js  # Dark/Light mode toggle
│   ├── utils/             # Helper functions
│   │   ├── api.js         # API client functions
│   │   ├── validators.js  # Input validation
│   │   └── formatters.js  # Data formatting utilities
│   ├── styles/            # CSS stylesheets
│   │   ├── styles.css     # Main stylesheet
│   │   └── themes.css     # Theme variables
│   ├── App.js             # Main application component
│   └── index.js           # Application entry point
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## 🎨 Features

### Core Functionality
- **Video URL Input** - Smart YouTube URL detection
- **Format Selection** - Choose video quality and format
- **Audio Download** - Extract audio in MP3/M4A formats
- **Progress Tracking** - Real-time download progress
- **History** - Track previously downloaded content

### UI/UX Features
- **Responsive Design** - Works on all device sizes
- **Dark Mode** - Toggle between light and dark themes
- **Smooth Animations** - Professional transitions and effects
- **Error Handling** - User-friendly error messages
- **Loading States** - Clear feedback during operations

## 🔧 Available Scripts

### `npm start`
Runs the app in development mode.
Open [http://localhost:3001](http://localhost:3001) to view it in the browser.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.
Optimizes the build for best performance.

### `npm run eject`
**Note: this is a one-way operation. Once you `eject`, you can't go back!**

## 🎯 Components Overview

### App.js
Main application component that handles:
- State management
- API integration
- Theme toggling
- Download orchestration

### VideoCard Component
Displays video information:
- Thumbnail
- Title
- Duration
- Channel name
- View count

### DownloadForm Component
Handles download configuration:
- URL input
- Quality selection
- Format selection
- Advanced options (trim, subtitles)

### ProgressBar Component
Shows download progress:
- Percentage complete
- Download speed
- Estimated time remaining

## 🔐 Security Features

- **Input Validation** - Client-side URL validation
- **XSS Protection** - Sanitized user inputs
- **HTTPS Only** - Enforced secure connections in production
- **Content Security Policy** - Restricted resource loading

## 📱 Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 768px) { ... }

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) { ... }

/* Desktop */
@media (min-width: 1025px) { ... }
```

## 🎨 Theming

The application supports custom themes through CSS variables:

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --background-color: #ffffff;
  --text-color: #333333;
  --border-radius: 12px;
}

[data-theme="dark"] {
  --background-color: #1a1a1a;
  --text-color: #ffffff;
}
```

## 🐛 Troubleshooting

### Port already in use
```bash
# Change port in package.json or use:
PORT=3002 npm start
```

### API connection issues
- Verify backend is running on `http://localhost:3000`
- Check CORS configuration in backend
- Ensure `.env` file has correct API URL

### Build fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📝 Development Guidelines

### Code Style
- Use functional components with hooks
- Follow ESLint configuration
- Use meaningful variable names
- Add comments for complex logic

### Component Structure
```javascript
import React, { useState, useEffect } from 'react';

const ComponentName = ({ prop1, prop2 }) => {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Effect logic
  }, []);
  
  return (
    <div className="component-name">
      {/* Component JSX */}
    </div>
  );
};

export default ComponentName;
```

## 🚀 Deployment

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Drag and drop build folder to Netlify
```

### Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 📄 License

MIT License - See LICENSE file for details

## 👤 Author

Jayasakthi-07

## 🙏 Acknowledgments

- React.js - UI library
- Modern CSS features for styling
- Community contributions and feedback
