// server.js
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running ✅" });
});

// Dummy user data
const users = [
  { id: "user_101", name: "Alice Johnson", age: 25, isOnline: false },
  { id: "user_202", name: "Bob Smith", age: 30, isOnline: false },
  { id: "user_303", name: "Charlie Brown", age: 28, isOnline: false },
  { id: "user_404", name: "Diana Prince", age: 27, isOnline: false },
];

// Create HTTP + WS server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Helper: broadcast to all connected clients
const broadcast = (data) => {
  const json = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  });
};

wss.on("connection", (ws) => {
  console.log("✅ New client connected");
  ws.send(JSON.stringify({ type: "info", message: "Welcome! Please send your id." }));

  ws.on("message", (message) => {
    let data;
    try {
      data = JSON.parse(message.toString());
    } catch (err) {
      ws.send(JSON.stringify({ type: "error", message: "Invalid JSON format ❌" }));
      return;
    }

    switch (data.type) {
      case "connect":
        if (data.id) {
          const userData = users.find((u) => u.id === data.id);
          if (userData) {
            ws.id = data.id;
            userData.isOnline = true;

            console.log(`👤 ${ws.id} connected`);
            ws.send(JSON.stringify({ type: "connected", id: ws.id }));

            // Broadcast updated users
            broadcast({ type: "userData", payload: users });
          } else {
            ws.send(JSON.stringify({ type: "error", message: "❌ No matching user found" }));
          }
        }
        break;

      case "chat":
        if (data.text && data.from) {
          console.log(`💬 ${data.from}: ${data.text}`);
          // Broadcast chat message to everyone
          broadcast({
            type: "chat",
            from: data.from,
            text: data.text,
            timestamp: new Date().toISOString(),
          });
        }
        break;

      case "check":
        if (data.id) {
          const isOnline = users.some((u) => u.id === data.id && u.isOnline);
          ws.send(JSON.stringify({ type: "status", id: data.id, isOnline }));
        }
        break;

      default:
        ws.send(JSON.stringify({ type: "error", message: "Unknown type" }));
    }
  });

  ws.on("close", () => {
    if (ws.id) {
      console.log(`❌ ${ws.id} disconnected`);
      const user = users.find((u) => u.id === ws.id);
      if (user) user.isOnline = false;

      // Broadcast updated users
      broadcast({ type: "userData", payload: users });
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket running on ws://localhost:${PORT}`);
});
