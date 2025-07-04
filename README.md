# ISHC Socket.io Server

A simple Socket.io server using Express, suitable for deployment on Railway, Render, Fly.io, and similar platforms.

## Features
- Express HTTP server
- Socket.io for real-time communication
- CORS enabled for cross-origin requests

## Getting Started

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   node index.js
   ```
3. The server will run on `http://localhost:3000` by default.

### Deployment

- Set the `PORT` environment variable if required by your hosting platform (the server will use it automatically).
- Deploy to Railway, Render, Fly.io, or any Node.js-compatible host.

### Example Socket.io Usage

- Connect from a client:
  ```js
  const socket = io('https://your-deployed-server-url');
  socket.on('connect', () => {
    console.log('Connected:', socket.id);
  });
  socket.emit('echo', 'Hello!');
  socket.on('echo', (msg) => {
    console.log('Echoed:', msg);
  });
  ```

## Endpoints
- `GET /` — Health check, returns a simple message.
- Socket.io events:
  - `echo` — Echoes back any data sent.

## License
ISHC 