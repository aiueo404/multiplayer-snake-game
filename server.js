const { randomInt, getRandomValues } = require("crypto");
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const MAP_WIDTH = 40;
const MAP_HEIGHT = 40;

let players = {};
let items = {};

wss.on("connection", (ws) => {
  const id = Date.now();
  players[id] = { x: 10, y: 10, dx: 1, dy: 0 };

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);
    if (data.type === "move") {
      players[id].dx = data.dx;
      players[id].dy = data.dy;
    }
  });

  ws.on("close", () => {
    delete players[id];
  });
});

function spawnItem() {
  const id = Date.now();
  const x = getRandomInt(0, MAP_WIDTH - 1);
  const y = getRandomInt(0, MAP_HEIGHT - 1);
  items[id] = { x: x, y: y };
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

setInterval(() => {
  for (let id in players) {
    players[id].x += players[id].dx;
    players[id].y += players[id].dy;
    // マップの端でループさせる
    if (players[id].x < 0) players[id].x = MAP_WIDTH - 1;
    if (players[id].x >= MAP_WIDTH) players[id].x = 0;
    if (players[id].y < 0) players[id].y = MAP_HEIGHT - 1;
    if (players[id].y >= MAP_HEIGHT) players[id].y = 0;
  }
  const state = JSON.stringify({ players, items });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(state);
    }
  });
}, 100);

spawnItem();

app.use(express.static("public"));
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
