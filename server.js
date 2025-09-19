const express = require("express");
const http = require("http");
const socket = require("./socket");
const app = express();

const server = http.createServer(app);
socket(server);
const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});