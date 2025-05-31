const CELL_SIZE = 10;
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const ws = new WebSocket("ws://localhost:3000");
let players = {};
let items = {};

ws.onopen = () => {
  console.log("WebSocket connected");
};
ws.onerror = (err) => {
  console.error("WebSocket error", err);
};

ws.onmessage = (msg) => {
  const data = JSON.parse(msg.data);
  if (data.type === "chat") {
    addChatMessage(data.id, data.message);
  } else if (data.players && data.items) {
    players = data.players;
    items = data.items;
  }
};

const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");
chatSend.addEventListener("click", sendChat);
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendChat();
});

function sendChat() {
  const msg = chatInput.value.trim();
  if (msg) {
    ws.send(JSON.stringify({ type: "chat", message: msg }));
    chatInput.value = "";
  }
}

function addChatMessage(id, message) {
  const chatMessages = document.getElementById("chat-messages");
  const div = document.createElement("div");
  div.textContent = `[${id.slice(0, 6)}] ${message}`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.addEventListener("keydown", (e) => {
  let dx = 0,
    dy = 0;
  if (e.key === "ArrowUp") dy = -1;
  else if (e.key === "ArrowDown") dy = 1;
  else if (e.key === "ArrowLeft") dx = -1;
  else if (e.key === "ArrowRight") dx = 1;
  else return; // 矢印キー以外は無視
  ws.send(JSON.stringify({ type: "move", dx, dy }));
});

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let id in players) {
    let p = players[id];
    ctx.fillStyle = "green";
    if (Array.isArray(p.body)) {
      for (let b of p.body) {
        ctx.fillRect(b.x * CELL_SIZE, b.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }
  ctx.fillStyle = "red";
  for (let id in items) {
    let i = items[id];
    ctx.fillRect(i.x * CELL_SIZE, i.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }
  requestAnimationFrame(gameLoop);
}
gameLoop();
