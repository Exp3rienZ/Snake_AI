let gameframe = document.getElementById("gameframe");
let scoreCounter = document.getElementById("score");
let speedInput = document.getElementById("speed");
let sizeInput = document.getElementById("size");
let speedLabel = document.getElementById("speedLabel");
let sizeLabel = document.getElementById("sizeLabel");
let highscores = document.getElementById("highscores");
let highscoreSettings = document.getElementById("highscoreSettings");
let appleCountLabel = document.getElementById("appleCountLabel");
let appleCountInput = document.getElementById("appleCount");

let runtime;
let highscoreDataSets = [];
let highscoresLoaded = false;

let fieldnumber = 15;
let game_speed = 280;
let walkableWalls = true;
let selectedColor = "green";
let appleCount = 1;

let game_paused = false;
let game_over = true;

let sound_game_over = new Audio("./ressource/sounds/game_over.wav");
let sound_apple_eaten = new Audio("./ressource/sounds/apple_eaten.wav");

class highscoreSet {
  constructor(speed, size, appleCount, walkableWalls) {
    this.speed = speed;
    this.size = size;
    this.walkableWalls = walkableWalls;
    this.appleCount = appleCount;
    this.data = [0];
    for (let n = 0; n < 9; n++) {
      this.data.push(0);
    }
  }

  getScore(n) {
    return this.data[n];
  }
}

for (let i = 0; i < 11; i++) {
  for (let p = 10; p < 31; p++) {
    for (let q = 1; q < 6; q++) {
      highscoreDataSets.push(new highscoreSet(i, p, q, 0));
      highscoreDataSets.push(new highscoreSet(i, p, q, 1));
    }
  }
}

let snake = [
  [1, 3],
  [1, 2],
  [1, 1],
];
let apples = [];
let direction = "right";

window.addEventListener("keydown", function (event) {
  if (event.defaultPrevented) {
    return;
  }
  if (event.code == "ArrowLeft") {
    switch (direction) {
      case "up":
        direction = "left";
        break;
      case "left":
        direction = "down";
        break;
      case "down":
        direction = "right";
        break;
      case "right":
        direction = "up";
        break;
      default:
        break;
    }
  }
  if (event.code == "ArrowRight") {
    switch (direction) {
      case "up":
        direction = "right";
        break;
      case "right":
        direction = "down";
        break;
      case "down":
        direction = "left";
        break;
      case "left":
        direction = "up";
        break;
      default:
        break;
    }
  }
  if (event.code == "Space") {
    pressPlay();
  }
});

for (let i = 1; i < fieldnumber; i++) {
  for (let k = 1; k < fieldnumber; k++) {
    gameframe.innerHTML +=
      '<div class="field" style="grid-column-start: ' +
      i +
      "; grid-row-start: " +
      k +
      ';"></div>';
  }
}

function getField(x, y) {
  return gameframe.childNodes[x - 1 + (fieldnumber - 1) * (y - 1)];
}

function changeSize(input) {
  sizeLabel.innerHTML = "Size: " + input;
  fieldnumber = input;
  gameframe.innerHTML = "";
  for (let i = 1; i < fieldnumber; i++) {
    for (let k = 1; k < fieldnumber; k++) {
      gameframe.innerHTML +=
        '<div class="field" style="grid-column-start: ' +
        i +
        "; grid-row-start: " +
        k +
        ';"></div>';
    }
  }
}

function changeSpeed(input) {
  speedLabel.innerHTML = "Speed: " + input;
  game_speed = 530 - input * 50;
}

function color_field(x, y, color) {
  getField(x, y).style.backgroundColor = color;
}

gameframe.classList.add("gameframeWalkableWalls");
gameframe.classList.remove("gameframe");

function changeWalls() {
  walkableWalls = !walkableWalls;
  if (walkableWalls) {
    gameframe.classList.add("gameframeWalkableWalls");
    gameframe.classList.remove("gameframe");
  } else {
    gameframe.classList.add("gameframe");
    gameframe.classList.remove("gameframeWalkableWalls");
  }
}

function changeColor(input) {
  selectedColor = "#" + input;
}

function changeAppleCount(input) {
  appleCount = parseInt(input);
  appleCountLabel.innerHTML = "Apple Count: " + appleCount;
  apples = [];
  for (let i = 0; i < input; i++) {
    apples.push[(i, i)];
  }
  changeHighScoreSettings(
    (game_speed - 530) / -50,
    fieldnumber,
    walkableWalls,
    appleCount
  );
  if (highscoresLoaded) {
    loadHighscores();
  }
}

function pressPlay() {
  let playbutton = document.getElementById("playbutton");
  if (playbutton.classList.contains("pausedPlayButton")) {
    playbutton.classList.remove("pausedPlayButton");
    playbutton.classList.add("playbutton");
  } else {
    playbutton.classList.remove("playbutton");
    playbutton.classList.add("pausedPlayButton");
  }
  if (game_over == false) {
    game_paused = !game_paused;
  } else {
    game_over = false;
    start_game();
  }
}

function newApple(headX, headY) {
  let done = false;
  let randX = 0;
  let randY = 0;
  for (let o = 0; o < apples.length; o++) {
    if (apples[o][1] == headX && apples[o][0] == headY) {
      let toSplice = apples.splice(o, 1);
      console.log(toSplice);
    }
  }
  while (done == false) {
    done = true;
    randX = Math.floor(Math.random() * (fieldnumber - 1) + 1);
    randY = Math.floor(Math.random() * (fieldnumber - 1) + 1);
    console.log(randX + ", " + randY);
    for (let k = 0; k < snake.length; k++) {
      if (snake[k][0] == randY && snake[k][1] == randX) {
        done = false;
      }
    }
    for (let n = 0; n < apples.length; n++) {
      if (apples[n][0] == randY && apples[n][1] == randX) {
        done = false;
      }
    }
  }
  apples.push([randY, randX]);
  color_field(randY, randX, "darkred");
}

function renderFrame() {
  //Snakemove:
  if (!game_paused) {
    let next_x = 0;
    let next_y = 0;
    switch (direction) {
      case "up":
        next_x = snake[0][1];
        next_y = snake[0][0] - 1;
        break;
      case "right":
        next_x = snake[0][1] + 1;
        next_y = snake[0][0];
        break;
      case "down":
        next_x = snake[0][1];
        next_y = snake[0][0] + 1;
        break;
      case "left":
        next_x = snake[0][1] - 1;
        next_y = snake[0][0];
        break;
      default:
        break;
    }
    //Wrap-Around:
    if (next_x > fieldnumber - 1) {
      if (walkableWalls == true) {
        next_x = 1;
      } else {
        clearInterval(runtime);
        game_over = true;
        playbutton.classList.remove("pausedPlayButton");
        playbutton.classList.add("playbutton");
        sound_game_over.play();
        return;
      }
    }
    if (next_x < 1) {
      if (walkableWalls == true) {
        next_x = fieldnumber - 1;
      } else {
        clearInterval(runtime);
        game_over = true;
        playbutton.classList.remove("pausedPlayButton");
        playbutton.classList.add("playbutton");
        return;
      }
    }
    if (next_y > fieldnumber - 1) {
      if (walkableWalls == true) {
        next_y = 1;
      } else {
        clearInterval(runtime);
        game_over = true;
        playbutton.classList.remove("pausedPlayButton");
        playbutton.classList.add("playbutton");
        return;
      }
    }
    if (next_y < 1) {
      if (walkableWalls == true) {
        next_y = fieldnumber - 1;
      } else {
        clearInterval(runtime);
        game_over = true;
        playbutton.classList.remove("pausedPlayButton");
        playbutton.classList.add("playbutton");
        return;
      }
    }

    //Game-Over-Detection:
    for (let k = 0; k < snake.length; k++) {
      if (snake[k][0] == next_y && snake[k][1] == next_x) {
        clearInterval(runtime);
        game_over = true;
        playbutton.classList.remove("pausedPlayButton");
        playbutton.classList.add("playbutton");
        return;
      }
    }

    //Apple-Detection:
    let appleHit = false;
    for (let n = 0; n < apples.length; n++) {
      if (next_x == apples[n][1] && next_y == apples[n][0]) {
        appleHit = true;
        newApple(next_x, next_y);
        let scoreCount = parseInt(scoreCounter.innerHTML);
        scoreCount++;
        scoreCounter.innerHTML = scoreCount;
      }
    }
    if (appleHit == false) {
      let to_eraze = snake.pop();
      color_field(to_eraze[0], to_eraze[1], "");
    } else {
      sound_apple_eaten.play();
    }

    snake.unshift([next_y, next_x]);

    for (let z = 0; z < snake.length; z++) {
      color_field(snake[z][0], snake[z][1], selectedColor);
    }
    let headOfSnake = getField(snake[0][0], snake[0][1]);
    headOfSnake.style.filter = "brightness(80%)";
    let fieldAfterHead = getField(snake[1][0], snake[1][1]);
    fieldAfterHead.style.filter = "brightness(100%)";
  }
}

function start_game() {
  clearInterval(runtime);
  scoreCounter.innerHTML = "0";
  for (let i = 0; i < (fieldnumber - 1) * (fieldnumber - 1); i++) {
    gameframe.childNodes[i].style.backgroundColor = "";
  }
  snake = [
    [1, 3],
    [1, 2],
    [1, 1],
  ];
  direction = "right";

  snake.forEach(function (item, index, snake) {
    color_field(item[0], item[1], selectedColor);
  });
  let headOfSnake = getField(snake[0][0], snake[0][1]);
  headOfSnake.style.filter = "brightness(80%)";

  for (let i = 0; i < appleCount; i++) {
    newApple(4, 1);
  }
  runtime = setInterval(renderFrame, game_speed);
}
