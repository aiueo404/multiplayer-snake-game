const CELL_SIZE = 10;
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const ws = new WebSocket("wss://multiplayer-snake-game-ofbs.onrender.com");
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
  players = data.players;
  items = data.items;
};

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
  ctx.fillStyle = "green";
  for (let id in players) {
    let p = players[id];
    ctx.fillRect(p.x * CELL_SIZE, p.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }
  ctx.fillStyle = "red";
  for (let id in items) {
    let i = items[id];
    ctx.fillRect(i.x * CELL_SIZE, i.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }
  requestAnimationFrame(gameLoop);
}
gameLoop();
