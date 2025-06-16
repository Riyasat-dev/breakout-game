const grid = document.querySelector(".grid");
const ball = document.querySelector(".ball");
const paddle = document.querySelector(".paddle");
const playButton = document.getElementById("playButton");

let ballDirectionX = 1;
let ballDirectionY = 1;
let blocks = [];
let gameStarted = false;
let gameInterval;
let ballSpeed = 5;
let paddleSpeed = 12;

function initGame() {
  ball.style.left = `${window.innerWidth / 2 - 10}px`;
  ball.style.top = `${window.innerHeight / 2 - 10}px`;
  paddle.style.left = `${window.innerWidth / 2 - 50}px`;

  grid.innerHTML = "";
  blocks = [];

  const colors = ["#ff6b6b", "#ffa502", "#2ed573", "#1e90ff", "#a55eea"];

  for (let i = 0; i < 50; i++) {
    const block = document.createElement("div");
    block.style.background = colors[i % colors.length];
    grid.appendChild(block);
    blocks.push(block);
  }
}

function resetBall() {
  ball.style.left = `${window.innerWidth / 2 - 10}px`;
  ball.style.top = `${window.innerHeight / 2 - 10}px`;
  ballDirectionX = Math.random() > 0.5 ? 1 : -1; // Random initial direction
  ballDirectionY = 1;
}

function moveBall() {
  const ballRect = ball.getBoundingClientRect();
  const newX = ballRect.left + ballSpeed * ballDirectionX;
  const newY = ballRect.top + ballSpeed * ballDirectionY;

  ball.style.left = `${newX}px`;
  ball.style.top = `${newY}px`;
}

function checkWallCollision() {
  const ballRect = ball.getBoundingClientRect();

  if (ballRect.left <= 0 || ballRect.right >= window.innerWidth) {
    ballDirectionX *= -1;
  }

  if (ballRect.top <= 0) {
    ballDirectionY *= -1;
  }

  if (ballRect.bottom >= window.innerHeight) {
    endGame(false);
  }
}

function checkBlockCollisions() {
  const ballRect = ball.getBoundingClientRect();
  let blocksRemoved = 0;

  blocks.forEach((block) => {
    if (block.classList.contains("remove")) {
      blocksRemoved++;
      return;
    }

    const blockRect = block.getBoundingClientRect();

    if (
      ballRect.left < blockRect.right &&
      ballRect.right > blockRect.left &&
      ballRect.top < blockRect.bottom &&
      ballRect.bottom > blockRect.top
    ) {
      block.classList.add("remove");
      ballDirectionY *= -1;

      if (blocksRemoved === blocks.length - 1) {
        endGame(true);
      }
    }
  });
}

function checkPaddleCollision() {
  const ballRect = ball.getBoundingClientRect();
  const paddleRect = paddle.getBoundingClientRect();

  if (
    ballRect.left < paddleRect.right &&
    ballRect.right > paddleRect.left &&
    ballRect.bottom > paddleRect.top &&
    ballRect.top < paddleRect.bottom
  ) {
    const hitPosition =
      ballRect.left +
      ballRect.width / 2 -
      (paddleRect.left + paddleRect.width / 2);
    const normalizedHit = hitPosition / (paddleRect.width / 2);

    ballDirectionX = normalizedHit * 1.5; // More dynamic bounce
    ballDirectionY = -1;

    const maxAngle = 1.5;
    if (Math.abs(ballDirectionX) > maxAngle) {
      ballDirectionX = ballDirectionX > 0 ? maxAngle : -maxAngle;
    }
  }
}

function movePaddle(e) {
  if (!gameStarted) return;

  const paddleWidth = parseInt(getComputedStyle(paddle).width);
  let newPosition = e.clientX - paddleWidth / 2;

  newPosition = Math.max(
    0,
    Math.min(newPosition, window.innerWidth - paddleWidth)
  );

  paddle.style.left = `${newPosition}px`;
}

function endGame(isWin) {
  clearInterval(gameInterval);
  gameStarted = false;
  alert(isWin ? "You Win! 🎉" : "Game Over! 😢");
  initGame();
  playButton.style.display = "block";
}

function gameLoop() {
  moveBall();
  checkWallCollision();
  checkBlockCollisions();
  checkPaddleCollision();
}

function startGame() {
  if (gameStarted) return;

  playButton.style.display = "none";
  gameStarted = true;
  resetBall();
  gameInterval = setInterval(gameLoop, 20);
}

playButton.addEventListener("click", startGame);
document.addEventListener("mousemove", movePaddle);

window.addEventListener("load", initGame);

window.addEventListener("resize", function () {
  if (!gameStarted) {
    initGame();
  }
});
