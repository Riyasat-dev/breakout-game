const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score-display");
const livesDisplay = document.getElementById("lives-display");
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const leftBtn = document.getElementById("left-btn");
const rightBtn = document.getElementById("right-btn");
const gameResult = document.getElementById("game-result");
const finalScore = document.getElementById("final-score");

let canvasWidth, canvasHeight;
let gameRunning = false;
let score = 0;
let lives = 3;
let bricks = [];
let brickRowCount = 5;
let brickColumnCount = 8;
let brickWidth = 0;
let brickHeight = 15;
let brickPadding = 10;
let brickOffsetTop = 60;
let brickOffsetLeft = 0;

let paddleWidth = 100;
let paddleHeight = 15;
let paddleX = 0;
let paddleSpeed = 8;

let ballRadius = 10;
let ballX = 0;
let ballY = 0;
let ballSpeedX = 5;
let ballSpeedY = -5;

let touchX = null;

function initGame() {
  resizeCanvas();
  createBricks();
  resetBallAndPaddle();

  window.addEventListener("resize", resizeCanvas);
  canvas.addEventListener("mousemove", mouseMoveHandler);
  canvas.addEventListener("touchmove", touchMoveHandler, { passive: false });
  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", startGame);
  leftBtn.addEventListener("mousedown", () => movePaddle(-1));
  leftBtn.addEventListener("touchstart", () => movePaddle(-1));
  rightBtn.addEventListener("mousedown", () => movePaddle(1));
  rightBtn.addEventListener("touchstart", () => movePaddle(1));
  leftBtn.addEventListener("mouseup", stopPaddle);
  leftBtn.addEventListener("touchend", stopPaddle);
  rightBtn.addEventListener("mouseup", stopPaddle);
  rightBtn.addEventListener("touchend", stopPaddle);
}

function resizeCanvas() {
  canvasWidth = canvas.parentElement.clientWidth;
  canvasHeight = canvas.parentElement.clientHeight;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  brickWidth =
    (canvasWidth -
      brickPadding * (brickColumnCount - 1) -
      brickOffsetLeft * 2) /
    brickColumnCount;
  brickOffsetLeft =
    (canvasWidth -
      (brickColumnCount * (brickWidth + brickPadding) - brickPadding)) /
    2;
  paddleWidth = Math.min(100, canvasWidth * 0.25);
  resetBallAndPaddle();

  if (gameRunning) {
    draw();
  }
}

function createBricks() {
  bricks = [];
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }
}

function resetBallAndPaddle() {
  paddleX = (canvasWidth - paddleWidth) / 2;
  ballX = canvasWidth / 2;
  ballY = canvasHeight - 30;
  ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
  ballSpeedY = -5;
}

function startGame() {
  score = 0;
  lives = 3;
  updateScore();
  updateLives();
  createBricks();
  resetBallAndPaddle();
  startScreen.style.display = "none";
  gameOverScreen.style.display = "none";
  gameRunning = true;
  requestAnimationFrame(gameLoop);
}

function endGame(win) {
  gameRunning = false;
  gameResult.textContent = win ? "You Win!" : "Game Over";
  finalScore.textContent = `Score: ${score}`;
  gameOverScreen.style.display = "flex";
}

function mouseMoveHandler(e) {
  if (!gameRunning) return;
  const relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvasWidth) {
    paddleX = relativeX - paddleWidth / 2;
    if (paddleX < 0) paddleX = 0;
    if (paddleX + paddleWidth > canvasWidth)
      paddleX = canvasWidth - paddleWidth;
  }
}

function touchMoveHandler(e) {
  if (!gameRunning) return;
  e.preventDefault();
  const touch = e.touches[0];
  const relativeX = touch.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvasWidth) {
    paddleX = relativeX - paddleWidth / 2;
    if (paddleX < 0) paddleX = 0;
    if (paddleX + paddleWidth > canvasWidth)
      paddleX = canvasWidth - paddleWidth;
  }
}

let paddleDirection = 0;

function movePaddle(direction) {
  paddleDirection = direction;
}

function stopPaddle() {
  paddleDirection = 0;
}

function updateScore() {
  scoreDisplay.textContent = `Score: ${score}`;
}

function updateLives() {
  livesDisplay.textContent = `Lives: ${lives}`;
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const brick = bricks[c][r];
      if (brick.status === 1) {
        if (
          ballX > brick.x &&
          ballX < brick.x + brickWidth &&
          ballY > brick.y &&
          ballY < brick.y + brickHeight
        ) {
          ballSpeedY = -ballSpeedY;
          brick.status = 0;
          score++;
          updateScore();

          let allBricksBroken = true;
          for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
              if (bricks[c][r].status === 1) {
                allBricksBroken = false;
                break;
              }
            }
            if (!allBricksBroken) break;
          }

          if (allBricksBroken) {
            endGame(true);
          }
        }
      }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;

        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = `hsl(${r * 60}, 100%, 50%)`;
        ctx.fill();
        ctx.closePath();
      }
    }
  }

  ctx.beginPath();
  ctx.rect(
    paddleX,
    canvasHeight - paddleHeight - 10,
    paddleWidth,
    paddleHeight
  );
  ctx.fillStyle = "#4fc3f7";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath();
}

function gameLoop() {
  if (!gameRunning) return;

  if (paddleDirection !== 0) {
    paddleX += paddleSpeed * paddleDirection;
    if (paddleX < 0) paddleX = 0;
    if (paddleX + paddleWidth > canvasWidth)
      paddleX = canvasWidth - paddleWidth;
  }

  ballX += ballSpeedX;
  ballY += ballSpeedY;

  if (
    ballX + ballSpeedX > canvasWidth - ballRadius ||
    ballX + ballSpeedX < ballRadius
  ) {
    ballSpeedX = -ballSpeedX;
  }

  if (ballY + ballSpeedY < ballRadius) {
    ballSpeedY = -ballSpeedY;
  } else if (
    ballY + ballSpeedY >
    canvasHeight - ballRadius - paddleHeight - 10
  ) {
    if (ballX > paddleX && ballX < paddleX + paddleWidth) {
      const hitPosition =
        (ballX - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
      ballSpeedX = hitPosition * 5;
      ballSpeedY = -Math.abs(ballSpeedY);
    } else if (ballY + ballSpeedY > canvasHeight - ballRadius) {
      lives--;
      updateLives();

      if (lives <= 0) {
        endGame(false);
        return;
      } else {
        resetBallAndPaddle();
      }
    }
  }

  collisionDetection();
  draw();
  requestAnimationFrame(gameLoop);
}

initGame();
