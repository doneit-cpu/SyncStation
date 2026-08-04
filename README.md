# SyncStation
  
   SyncStation is a lightweight, self-hosted clipboard synchronization engine designed for seamless text sharing across devices. Built with performance and privacy in mind, it bridges
   your clipboard across desktop and mobile in real-time.
  
   ## Key MVP Features
  
    - **Self-Hosted Architecture:** You control your data. Host the server locally or on your own infrastructure.
    - **Real-time Clipboard Bridge:** Bi-directional text synchronization with near-zero latency.
    - **Intelligent Room Management:** Isolate your workflows with dedicated, unique room codes.
      - **Instant Connection:** Generate QR codes and shareable links for rapid multi-device onboarding.
      - **Public Tunneling:** Integrated Tunnelmole support for exposing your local instance to the web securely when needed.
   
  ## Tech Stack
    - **Backend:** Node.js, Express, Socket.io
    - **Frontend:** React, TypeScript, Vite
    - **Networking:** Socket.io (Real-time), Tunnelmole (Public Tunneling)
   
  ## Getting Started
   
    1. **Clone the repository.**
    2. **Setup Server:** Navigate to `/server`, run `npm install`, and start with `npm run dev`.
    3. **Setup Client:** Navigate to `/client`, run `npm install`, and start with `npm run dev`.
    4. **Sync:** Open the app in your browser to generate a room code and start sharing.
   
   ## Future Roadmap
   
    - [ ] Complete Glassmorphic UI/UX overhaul.
    - [ ] Implement Private Room Passwords.
    - [ ] Add File Sharing capabilities.
    - [ ] Native Electron wrapper for background system-level synchronization.

