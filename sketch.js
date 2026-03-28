var START = 2;
var PLAY = 1;
var END = 0;
var PAUSE = 3;

var gameState = START;

var trex;
var trex_running;
var trex_collided;

var ground;
var invisibleGround;
var groundImage;

var cloudsGroup;
var cloudImage;

var obstaclesGroup;
var obstacle1;
var obstacle2;
var obstacle3;
var obstacle4;
var obstacle5;
var obstacle6;

var score = 0;
var highScore = 0;

var gameOver;
var restart;
var gameOverImg;
var restartImg;

var baseSpeed = 6;
var maxSpeed = 11;
var jumpForce = -13;
var gravity = 0.7;

var skyOffset = 0;

function preload() {
  trex_running = loadAnimation("trex1.png", "trex3.png", "trex4.png");
  trex_collided = loadAnimation("trex_collided.png");

  groundImage = loadImage("ground2.png");
  cloudImage = loadImage("cloud.png");

  obstacle1 = loadImage("obstacle1.png");
  obstacle2 = loadImage("obstacle2.png");
  obstacle3 = loadImage("obstacle3.png");
  obstacle4 = loadImage("obstacle4.png");
  obstacle5 = loadImage("obstacle5.png");
  obstacle6 = loadImage("obstacle6.png");

  gameOverImg = loadImage("gameOver.png");
  restartImg = loadImage("restart.png");
}

function setup() {
  var canvas = createCanvas(900, 320);
  canvas.parent("game-wrapper");

  if (localStorage.getItem("HighestScore") === null) {
    localStorage.setItem("HighestScore", "0");
  }

  highScore = Number(localStorage.getItem("HighestScore"));

  trex = createSprite(90, 245, 20, 50);
  trex.addAnimation("running", trex_running);
  trex.addAnimation("collided", trex_collided);
  trex.scale = 0.65;

  ground = createSprite(width / 2, 265, 400, 20);
  ground.addImage("ground", groundImage);
  ground.x = ground.width / 2;
  ground.scale = 1.15;

  invisibleGround = createSprite(width / 2, 285, width, 10);
  invisibleGround.visible = false;

  gameOver = createSprite(width / 2, 120);
  gameOver.addImage(gameOverImg);
  gameOver.scale = 0.8;
  gameOver.visible = false;

  restart = createSprite(width / 2, 170);
  restart.addImage(restartImg);
  restart.scale = 0.8;
  restart.visible = false;

  cloudsGroup = new Group();
  obstaclesGroup = new Group();

  textFont("Arial");
}

function draw() {
  drawSky();
  drawDecor();

  if (gameState === START) {
    ground.velocityX = 0;
    trex.velocityY = trex.velocityY + gravity;
    trex.collide(invisibleGround);

    drawSprites();
    drawHUD();
    drawStartScreen();

    if (jumpPressed()) {
      startGame();
    }
  }
  else if (gameState === PLAY) {
    score = score + Math.round(getFrameRate() / 60);
    skyOffset += 0.3;

    ground.velocityX = -getGameSpeed();

    if (jumpPressed() && trex.y >= 220) {
      trex.velocityY = jumpForce;
    }

    trex.velocityY = trex.velocityY + gravity;

    if (ground.x < 0) {
      ground.x = ground.width / 2;
    }

    trex.collide(invisibleGround);

    spawnClouds();
    spawnObstacles();

    if (obstaclesGroup.isTouching(trex)) {
      gameState = END;
      saveHighScore();
    }

    if (keyWentDown("p")) {
      gameState = PAUSE;
    }

    drawSprites();
    drawHUD();
  }
  else if (gameState === PAUSE) {
    ground.velocityX = 0;
    trex.velocityY = 0;
    obstaclesGroup.setVelocityXEach(0);
    cloudsGroup.setVelocityXEach(0);

    drawSprites();
    drawHUD();
    drawPauseOverlay();

    if (keyWentDown("p")) {
      resumeGame();
    }
  }
  else if (gameState === END) {
    gameOver.visible = true;
    restart.visible = true;

    ground.velocityX = 0;
    trex.velocityY = 0;
    obstaclesGroup.setVelocityXEach(0);
    cloudsGroup.setVelocityXEach(0);

    trex.changeAnimation("collided", trex_collided);

    obstaclesGroup.setLifetimeEach(-1);
    cloudsGroup.setLifetimeEach(-1);

    drawSprites();
    drawHUD();
    drawEndText();

    if (mousePressedOver(restart) || keyWentDown("space")) {
      reset();
    }
  }
}

function getGameSpeed() {
  return Math.min(baseSpeed + score / 180, maxSpeed);
}

function jumpPressed() {
  return keyWentDown("space") || touches.length > 0 || mouseWentDown();
}

function mouseWentDown() {
  return mouseIsPressed && mouseButton === LEFT;
}

function startGame() {
  gameState = PLAY;
  if (trex.y >= 220) {
    trex.velocityY = jumpForce;
  }
  touches = [];
}

function resumeGame() {
  gameState = PLAY;
  ground.velocityX = -getGameSpeed();

  for (var i = 0; i < obstaclesGroup.length; i++) {
    obstaclesGroup[i].velocityX = -getGameSpeed();
  }

  for (var j = 0; j < cloudsGroup.length; j++) {
    cloudsGroup[j].velocityX = -2.5;
  }
}

function drawSky() {
  background(225, 245, 255);

  noStroke();
  fill(255, 255, 255, 100);
  ellipse(130 + sin(frameCount * 0.01) * 12, 70, 120, 55);
  ellipse(190 + sin(frameCount * 0.01) * 10, 60, 140, 65);
  ellipse(700 + cos(frameCount * 0.01) * 8, 65, 150, 60);

  fill(255, 244, 186);
  ellipse(width - 90, 65, 52, 52);
}

function drawDecor() {
  stroke(170);
  strokeWeight(2);
  line(0, 275, width, 275);
  noStroke();
}

function drawHUD() {
  fill(35);
  textAlign(LEFT);
  textSize(22);
  text("Score: " + score, 24, 36);

  textAlign(RIGHT);
  text("High Score: " + highScore, width - 24, 36);

  textAlign(LEFT);
  textSize(14);
  fill(80);
  text("Speed: " + nf(getGameSpeed(), 1, 1), 24, 60);
}

function drawStartScreen() {
  fill(0, 0, 0, 140);
  rect(0, 0, width, height);

  fill(255);
  textAlign(CENTER);
  textSize(34);
  text("T-Rex Runner", width / 2, 105);

  textSize(18);
  text("Press SPACE or CLICK to start", width / 2, 145);
  text("Jump over obstacles and survive as long as you can", width / 2, 175);
  text("Press P anytime to pause", width / 2, 205);
}

function drawPauseOverlay() {
  fill(0, 0, 0, 120);
  rect(0, 0, width, height);

  fill(255);
  textAlign(CENTER);
  textSize(30);
  text("Paused", width / 2, 125);

  textSize(18);
  text("Press P to continue", width / 2, 160);
}

function drawEndText() {
  fill(50);
  textAlign(CENTER);
  textSize(16);
  text("Press SPACE or click Restart to play again", width / 2, 220);
}

function spawnClouds() {
  if (frameCount % 75 === 0) {
    var cloud = createSprite(width + 30, random(50, 140), 40, 10);
    cloud.addImage(cloudImage);
    cloud.scale = random(0.45, 0.75);
    cloud.velocityX = -2.5;
    cloud.lifetime = 400;

    cloud.depth = trex.depth;
    trex.depth = trex.depth + 1;

    cloudsGroup.add(cloud);
  }
}

function spawnObstacles() {
  var spawnRate = Math.max(55, 85 - Math.floor(score / 35));

  if (frameCount % spawnRate === 0) {
    var obstacle = createSprite(width + 20, 248, 10, 40);
    obstacle.velocityX = -getGameSpeed();

    var rand = Math.round(random(1, 6));

    switch (rand) {
      case 1:
        obstacle.addImage(obstacle1);
        break;
      case 2:
        obstacle.addImage(obstacle2);
        break;
      case 3:
        obstacle.addImage(obstacle3);
        break;
      case 4:
        obstacle.addImage(obstacle4);
        break;
      case 5:
        obstacle.addImage(obstacle5);
        break;
      case 6:
        obstacle.addImage(obstacle6);
        break;
      default:
        break;
    }

    obstacle.scale = 0.6;
    obstacle.lifetime = 300;

    obstaclesGroup.add(obstacle);
  }
}

function saveHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("HighestScore", String(highScore));
  }
}

function reset() {
  gameState = PLAY;

  gameOver.visible = false;
  restart.visible = false;

  obstaclesGroup.destroyEach();
  cloudsGroup.destroyEach();

  trex.changeAnimation("running", trex_running);
  score = 0;
  ground.velocityX = -getGameSpeed();
}

function touchStarted() {
  if (gameState === START) {
    startGame();
  }
  else if (gameState === END) {
    reset();
  }

  return false;
}
