const CELL_SIZE = 10;
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const ws = new WebSocket("wss://multiplayer-snake-game-ofbs.onrender.com");
let players = {};

ws.onmessage = (msg) => {
  players = JSON.parse(msg.data);
};

document.addEventListener("keydown", (e) => {
  let dx = 0,
    dy = 0;
  if (e.key === "ArrowUp") dy = -1;
  if (e.key === "ArrowDown") dy = 1;
  if (e.key === "ArrowLeft") dx = -1;
  if (e.key === "ArrowRight") dx = 1;
  ws.send(JSON.stringify({ type: "move", dx, dy }));
});

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let id in players) {
    let p = players[id];
    ctx.fillRect(p.x * CELL_SIZE, p.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }
  requestAnimationFrame(gameLoop);
}
gameLoop();
