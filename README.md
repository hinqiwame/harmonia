<div align="center">
  <img src="https://github.com/hinqiwame/harmonia/raw/main/src/icon_header.png" width="100" />
  <h1>Harmonia 🎸</h1>

  <p><strong>Professional, accurate, and beautiful guitar tuner for desktop.</strong></p>

  <p>Harmonia is a modern, standalone guitar tuner application built with Electron. It features a sleek glassmorphic design, real-time pitch detection, and support for multiple popular tunings.</p>

  <img src="https://github.com/hinqiwame/harmonia/raw/main/src/screenshot.png" width="600" />
</div>

## ✨ Features

- **Precise Tuning Engine**: Real-time frequency analysis with visual needle and cents indication.
- **Multiple Tunings**: 
  - E Standard
  - Drop D
  - Drop C
  - Double Drop D
  - DADGAD
  - Open G, Open D, Open C
  - And many more...
- **Input Selection**: Choose any connected microphone or audio interface.
- **Visual Feedback**: Glowing indicators for "In Tune", "Sharp", or "Flat".
- **Custom UI**: Frameless window with custom minimize/close controls and a beautiful dark glass aesthetic.
- **Cross-Platform**: Available for Windows, macOS, and Linux.

## 🚀 Download

Download the latest version for your operating system from the **[Releases Page](https://github.com/hinqiwame/harmonia/releases)**.

- **Windows**: `.exe` (Portable)
- **macOS**: `.dmg`
- **Linux**: `.AppImage`

## 🛠️ Development

To build or modify Harmonia locally:

### Prerequisites
- Node.js (v18 or higher)
- npm

### Setup
```bash
# Clone the repository
git clone https://github.com/hinqiwame/harmonia.git

# Go into the app directory
cd harmonia

# Install dependencies
npm install

# Start the app in development mode
npm start
```

### Build Distribution
```bash
# Build for Windows
npm run build:win

# Build for macOS (requires macOS and signing identities, or use GitHub Actions)
npm run build:mac

# Build for Linux
npm run build:linux
```

## 🏗️ Architecture

- **Electron**: App wrapper and window management.
- **Vanilla JS**: Audio processing and logic (no heavy frameworks).
- **CSS Variables**: Easy theming and consistent design.

## 📄 License

MIT © [hinqiwame](https://github.com/hinqiwame)
