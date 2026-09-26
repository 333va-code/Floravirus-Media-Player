================================================================================
                       FLORAVIRUS MEDIA PLAYER (FMP)
                 High-Performance ASCII Video Player Engine
                             Version 2.4.0-16BIT
================================================================================

TABLE OF CONTENTS
--------------------------------------------------------------------------------
 1. PROJECT OVERVIEW & ARCHITECTURE
 2. TECHNICAL SPECIFICATIONS & SYSTEM REQUIREMENTS
 3. FILE STRUCTURE
 4. LOCAL HOSTING & ENVIRONMENT SETUP
    4.1. Option 1: Python Built-in Server (Recommended)
    4.2. Option 2: Node.js & Serve CLI
    4.3. Option 3: VS Code Live Server
    4.4. Option 4: Production Static Web Server (Nginx / Caddy / Apache)
 5. USER GUIDE & OPERATIONAL INSTRUCTIONS
    5.1. Loading Media
    5.2. Playback & Timeline Navigation
    5.3. Display Resolution & Scaling Mechanics
 6. UNDER THE HOOD: ASCII RENDERING PIPELINE
    6.1. High Color (16-Bit RGB565) Quantization
    6.2. Monospace Aspect Correction
    6.3. Canvas-Based Frame Thrashing Optimization
 7. TROUBLESHOOTING & FREQUENTLY ASKED QUESTIONS
 8. LICENSE & CREDITS

================================================================================
1. PROJECT OVERVIEW & ARCHITECTURE
================================================================================
Floravirus Media Player (FMP) is a browser-based, client-side video player 
engineered to convert uploaded video files into real-time, colorized ASCII art.
Inspired by classic retro desktop software skins and terminal applications, 
Floravirus Media Player couples a custom retro user interface (designed with an
off-black, desaturated reddish-purple, and faded orange color palette) with 
a high-performance HTML5 Canvas rendering engine.

Key Highlights:
- Zero external client-side framework dependencies (Vanilla JS / CSS3 / HTML5).
- Real-time 200-character wide terminal matrix layout.
- True 16-Bit RGB 5:6:5 High Color quantization (65,536 distinct colors).
- 30 Frames Per Second targeted rendering loop driven by requestAnimationFrame.
- Responsive canvas scaling engine that dynamically fits the window while 
  preserving aspect ratios.
- 100% Client-Side Processing: Your media files never touch a remote server,
  ensuring complete privacy and instantaneous local playback.

================================================================================
2. TECHNICAL SPECIFICATIONS & SYSTEM REQUIREMENTS
================================================================================
* Output Character Resolution : 200 characters across (X-axis), dynamic Y-axis.
* Frame Rate Target           : 30 Frames Per Second (FPS).
* Color Depth                 : 16-Bit High Color (RGB 5:6:5 / 65,536 Colors).
* Font Engine                 : Monospace ('Courier New', fallback to system mono).
* Supported Formats           : MP4, WebM, OGG, MOV, MKV (subject to browser codecs).
* Minimum Browser Version     : Google Chrome 90+, Mozilla Firefox 88+, 
                                Microsoft Edge 90+, Safari 14+.
* Hardware Requirements       : Modern CPU with integrated graphics capable of 
                                handling Canvas2D getImageData operations.

================================================================================
3. FILE STRUCTURE
================================================================================
The application footprint consists of three primary core files:

  ascii-player/
  │
  ├── index.html        # Main HTML5 application shell & retro layout
  ├── style.css         # Custom Floravirus skin styling & fullscreen rules
  ├── app.js            # Video capture, RGB565 engine, & ASCII render pipeline
  └── README.txt        # Documentation & setup guide (this file)

================================================================================
4. LOCAL HOSTING & ENVIRONMENT SETUP
================================================================================
Because Floravirus Media Player extracts raw pixel buffer data from the video element
via HTML5 Canvas (`getImageData`), browsers block execution under the `file://` 
protocol due to CORS (Cross-Origin Resource Sharing) security restrictions. 

To run the application locally, you MUST serve the directory over HTTP/HTTPS. 
Below are step-by-step methods to spin up a local development server.

--------------------------------------------------------------------------------
4.1. OPTION 1: PYTHON BUILT-IN SERVER (RECOMMENDED)
--------------------------------------------------------------------------------
Python is pre-installed on most macOS and Linux systems, and widely used on Windows.

1. Open your terminal or PowerShell prompt.
2. Navigate to the directory containing `index.html`:
   
   cd C:\Users\YourUsername\Downloads\ascii-player

3. Launch the HTTP server module:

   - On Windows (using standard launcher):
     py -m http.server 8000

   - On macOS / Linux or configured Windows environments:
     python3 -m http.server 8000

4. Open your web browser and navigate to:
   http://localhost:8000

--------------------------------------------------------------------------------
4.2. OPTION 2: NODE.JS & SERVE CLI
--------------------------------------------------------------------------------
If Node.js is installed on your machine, you can launch a local server without 
installing permanent global packages.

1. Open terminal and navigate to the project root:
   cd /path/to/ascii-player

2. Run the `serve` executable directly via `npx`:
   npx serve .

3. Open the output URL displayed in the console (typically `http://localhost:3000`).

--------------------------------------------------------------------------------
4.3. OPTION 3: VS CODE LIVE SERVER
--------------------------------------------------------------------------------
If you use Visual Studio Code:

1. Install the "Live Server" extension (by Ritwick Dey) from the VS Code Marketplace.
2. Open the `ascii-player` folder in VS Code.
3. Right-click `index.html` in the file explorer panel.
4. Select "Open with Live Server".
5. Your default browser will open automatically at `http://127.0.0.1:5500/index.html`.

--------------------------------------------------------------------------------
4.4. OPTION 4: PRODUCTION STATIC WEB SERVER
--------------------------------------------------------------------------------
To host Floravirus Media Player publicly on a remote server (e.g., AWS EC2, DigitalOcean,
Vercel, Netlify, or self-hosted Nginx/Caddy):

- Nginx Example Configuration (`/etc/nginx/sites-available/floravirus`):
  
  server {
      listen 80;
      server_name ascii.yourdomain.com;
      root /var/www/ascii-player;
      index index.html;

      location / {
          try_files $uri $uri/ =404;
      }
  }

Simply copy `index.html`, `style.css`, and `app.js` to your static web directory.
No server-side runtimes (Node, PHP, Python) are required in production.

================================================================================
5. USER GUIDE & OPERATIONAL INSTRUCTIONS
================================================================================

--------------------------------------------------------------------------------
5.1. LOADING MEDIA
--------------------------------------------------------------------------------
1. Launch the application in your browser using one of the HTTP server methods above.
2. Click the "LOAD FILE" button located in the bottom-right control deck.
3. Use the system OS dialog to select a video file (MP4, WebM, or MOV formats recommended).
4. Upon selection, the application will parse the metadata, calculate aspect ratio adjustments,
   display the video title in the top status bar, and immediately start playback.

--------------------------------------------------------------------------------
5.2. PLAYBACK & TIMELINE NAVIGATION
--------------------------------------------------------------------------------
- PLAY Button   : Resumes playback if paused.
- PAUSE Button  : Freezes the current ASCII frame and pauses audio/video execution.
- STOP Button   : Resumes video to the beginning (00:00) and halts rendering.
- SEEK BAR      : Click or drag the horizontal purple slider across the control deck to
                  jump instantaneously to any point in the video track.
- STATUS BAR    : Displays real-time current timestamp vs. total duration timestamp.

--------------------------------------------------------------------------------
5.3. DISPLAY RESOLUTION & SCALING MECHANICS
--------------------------------------------------------------------------------
Floravirus Media Player features a responsive viewport container:
- The engine computes a fixed matrix width of 200 character columns.
- The vertical character height is derived automatically based on the video's original
  aspect ratio and compensated for monospace font character heights.
- If you resize your web browser window, the canvas recalculates its CSS scale vector
  to ensure the entire 200-character image fits comfortably within the viewport without 
  cropping or horizontal scrolling.

================================================================================
6. UNDER THE HOOD: ASCII RENDERING PIPELINE
================================================================================

--------------------------------------------------------------------------------
6.1. HIGH COLOR (16-BIT RGB565) QUANTIZATION
--------------------------------------------------------------------------------
Standard HTML5 canvas color displays utilize 24-bit TrueColor (8 bits Red, 8 bits Green, 8 bits Blue).
To simulate retro terminal graphics and optimize performance, Floravirus Media Player
quantizes pixel data into 16-bit High Color (RGB 5:6:5):
- Red Channel   : 5 Bits (32 levels, 0 - 31)
- Green Channel : 6 Bits (64 levels, 0 - 63)
- Blue Channel  : 5 Bits (32 levels, 0 - 31)

To achieve 30 FPS at 200-character resolution without causing garbage collection spikes, 
the math uses pre-calculated Lookup Tables (LUTs) initialized during startup:

  lut5[i] = (i >> 3) * 8.2258;
  lut6[i] = (i >> 2) * 4.0476;

During the frame loop, each pixel's raw 8-bit channel value maps instantly via array offset,
drastically cutting mathematical operations per frame.

--------------------------------------------------------------------------------
6.2. MONOSPACE ASPECT CORRECTION
--------------------------------------------------------------------------------
Because standard monospace font characters are taller than they are wide (typically a 
1:2 or 3:5 aspect ratio), sampling a video 1:1 onto a character grid causes vertical stretching. 
FMP applies an aspect multiplier of `0.5` during sampling height generation:

  targetHeight = Math.round(TARGET_WIDTH * aspectRatio * 0.5);

This ensures objects, faces, and geometry rendered in ASCII maintain true geometric proportions.

--------------------------------------------------------------------------------
6.3. CANVAS-BASED FRAME THRASHING OPTIMIZATION
--------------------------------------------------------------------------------
Directly updating the Document Object Model (DOM) using thousands of `<span>` elements 
or string concatenation causes massive UI layout thrashing and drops frame rates to 
unusable levels (< 5 FPS).

FMP solves this by using two canvas layers:
1. Processing Canvas (`procCanvas`): An invisible offscreen buffer scaled down to 
   200 x Y pixels where video frames are drawn and sampled.
2. Output Display Canvas (`asciiCanvas`): A high-resolution canvas where character 
   glyphs are drawn directly using standard `fillText` calls with 16-bit quantized 
   fill styles.

================================================================================
7. TROUBLESHOOTING & FREQUENTLY ASKED QUESTIONS
================================================================================

Q: The video loads, but I see a black box and no text renders!
A: Ensure you are running the app through a local HTTP server (`localhost`) and NOT
   opening `index.html` directly via file explorer (`file:///C:/...`). Browser security 
   blocks canvas pixel sampling on local file protocols.

Q: The audio plays, but the ASCII video stutters or lags.
A: High resolutions (200 characters across) require processing tens of thousands of character 
   operations every second. Ensure hardware acceleration is enabled in your web browser 
   settings (Settings > System > Use graphics acceleration when available).

Q: Why are certain video files failing to play?
A: Web browsers only support specific container formats and codecs. MP4 encoded with
   H.264 video and AAC audio provides the highest compatibility across all OS platforms.

Q: Can I run this on mobile devices?
A: Yes! Floravirus Media Player is fully responsive and will adapt to mobile screen 
   widths, though high resolution processing may consume significant battery life on older mobile CPUs.

================================================================================
8. LICENSE & CREDITS
================================================================================
Floravirus Media Player (FMP)
Engineered for custom ASCII media rendering.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files, to deal in the Software 
without restriction, including without limitation the rights to use, copy, 
modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.

================================================================================
                              [ END OF DOCUMENT ]
================================================================================