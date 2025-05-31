const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const MAP_WIDTH = 40;
const MAP_HEIGHT = 40;

let players = {};
let items = {};
let chatHistory = []; // チャット履歴を保存する配列

wss.on("connection", (ws) => {
  const id = crypto.randomUUID();
  const startX = getRandomInt(1, MAP_WIDTH - 2);
  const startY = getRandomInt(1, MAP_HEIGHT - 2);
  players[id] = {
    x: startX,
    y: startY,
    dx: 1,
    dy: 0,
    body: [{ x: startX, y: startY }],
  };

  // 新しく接続したクライアントに履歴を送信
  chatHistory.forEach((msg) => ws.send(JSON.stringify(msg)));

  // 新規接続時に現在のゲーム状態を送信
  ws.send(JSON.stringify({ players, items }));

  // 他の全クライアントに新しいプレイヤーが追加されたことを通知
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ players, items }));
    }
  });

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);
    if (data.type === "move") {
      players[id].dx = data.dx;
      players[id].dy = data.dy;
    } else if (data.type === "chat") {
      const chatMsg = {
        type: "chat",
        id: data.id || "anonymous",
        message: data.message,
      };
      chatHistory.push(chatMsg); // 履歴に追加
      // 全クライアントに送信
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(chatMsg));
        }
      });
      // 履歴が多くなりすぎないように最大件数を制限
      if (chatHistory.length > 100) chatHistory.shift();
    }
  });

  ws.on("close", () => {
    delete players[id];
  });
});

function spawnItem() {
  const id = crypto.randomUUID();
  const x = getRandomInt(0, MAP_WIDTH - 1);
  const y = getRandomInt(0, MAP_HEIGHT - 1);
  items[id] = { x: x, y: y };
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

setInterval(() => {
  for (let pid in players) {
    const p = players[pid];
    const newX = (p.x + p.dx + MAP_WIDTH) % MAP_WIDTH;
    const newY = (p.y + p.dy + MAP_HEIGHT) % MAP_HEIGHT;

    p.body.unshift({ x: newX, y: newY });

    let gotItem = false;
    // マップの端でループさせる
    if (p.x < 0) p.x = MAP_WIDTH - 1;
    if (p.x >= MAP_WIDTH) p.x = 0;
    if (p.y < 0) p.y = MAP_HEIGHT - 1;
    if (p.y >= MAP_HEIGHT) p.y = 0;
    // プレイヤーがアイテムを取得する
    for (let iid in items) {
      if (newX == items[iid].x && newY == items[iid].y) {
        delete items[iid];
        spawnItem();
        gotItem = true;
      }
    }
    if (!gotItem) {
      p.body.pop();
    }

    p.x = newX;
    p.y = newY;
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
