const canvas = document.getElementById("game-canvas");
const context = canvas.getContext("2d");

const pedraButton = document.getElementById("pedra-option");
const papelButton = document.getElementById("papel-option");
const tesouraButton = document.getElementById("tesoura-option");

const gameContainer = document.getElementById("game-container");
const playerInput = document.getElementById("player-input");

pedraButton.addEventListener("click", () => makePlay("Pedra"));
papelButton.addEventListener("click", () => makePlay("Papel"));
tesouraButton.addEventListener("click", () => makePlay("Tesoura"));

let plays = [];

let playerName = null;
let playerPlay = null;

let opponentName = null;
let opponentPlay = null;

let result = null;
let gameState = "waiting";
let waitingMessage = "";

let playerScore = 0;
let opponentScore = 0;


const optionsPlay = document.getElementById("options-play");
optionsPlay.style.display = "none";

const resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", resetGame);
resetButton.style.display = "none"; // Esconder o botão inicialmente

const waitingMessageElement = document.getElementById("waiting-message");
waitingMessageElement.style.display = "block";

waitingMessageElement.innerHTML = "Aguardando oponente escolher o nome...";

const statusName = document.getElementById("status-name");
statusName.innerHTML = "Pressione Enter para enviar";
const nameInput = document.getElementById("name-input");


nameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      setPlayerName();
      checkNames(); // Verificar se ambos os nomes estão definidos
    }
  });

const socket = io();

socket.on("plays", (availablePlays) => {
    plays = availablePlays;
    draw();
});

socket.on("result", (data) => {
    playerPlay = data.player;
    opponentPlay = data.opponent;
    result = determineResult(playerPlay, opponentPlay);
    gameState = "result"; // atualiza o estado para "result"
    draw();
});

socket.on("waiting", (message) => {
    waitingMessage = message;
    draw();
});

socket.on("opponentName", (name) => {
    opponentName = name;
    waitingMessageElement.innerHTML = "Oponente aguardando você escolher seu nome...";
    checkNames(); // Verificar se ambos os nomes estão definidos
  });

  function determineResult(player, opponent) {
    if (player === opponent) {
      return "Empate!";
    } else if (
      (player === "Pedra" && opponent === "Tesoura") ||
      (player === "Papel" && opponent === "Pedra") ||
      (player === "Tesoura" && opponent === "Papel")
    ) {
      playerScore++; // Incrementa o ponto do jogador
      return "Você ganhou!";
    } else {
      opponentScore++; // Incrementa o ponto do oponente
      return "Você perdeu!";
    }
  }
function setPlayerName() {
    playerName = nameInput.value;
    statusName.innerHTML = "Nome escolhido: " + playerName;
    socket.emit("setPlayerName", playerName);
}

function updateScore() {
    const centerX = canvas.width / 2;
    const topY = 50;
  
    context.font = "bold 30px Arial";
    context.fillStyle = "#000";
    context.textAlign = "center";
    context.fillText(`Placar`, centerX, topY);
  
    context.font = "24px Arial";
    context.fillText(`${playerName} ${playerScore} - ${opponentName} ${opponentScore}`, centerX, topY + 30);
  }
  

function checkNames() {
    if (opponentName !== null && opponentName !== "" && playerName !== null && playerName !== "") {
      console.log(opponentName + " vs " + playerName);
      playerInput.style.display = "none";
      gameContainer.style.display = "flex";
      document.getElementById("namePlayer").innerHTML = `${playerName} vs ${opponentName}`;
      draw(); // Atualizar a tela quando ambos os nomes estiverem definidos
    }
  }
  
function imagePlayerPlay(play) {
    const image = new Image();
    image.src = `images/${play}.png`;
    image.onload = function () {
        const x = (canvas.width - image.width / 2) / 10;
        const y = (canvas.height - image.height / 8) / 2.5;
        context.drawImage(image, x, y, image.width / 1.5, image.height / 1.5);
    };
}

function imageOpponentPlay(play) {
    const image = new Image();
image.src = `images/${play}.png`;
image.onload = function () {
    const x = canvas.width - image.width / 1.2;
    const y = (canvas.height - image.height / 8) / 2.5;
    
    // Espelha a imagem horizontalmente
    context.save();
    context.scale(-1, 1);
    context.drawImage(image, -x - image.width / 1.5, y, image.width / 1.5, image.height / 1.5);
    context.restore();
};
}

function draw() {
    const playSize = canvas.width / 3;
    context.clearRect(0, 0, canvas.width, canvas.height);
    // Posicionar a imagem "versus.png" no centro da tela
    const image = new Image();
    image.src = "images/versus.png";
    image.onload = function () {
        const x = (canvas.width - image.width / 8) / 2;
        const y = (canvas.height - image.height / 8) / 2;
        context.drawImage(image, x, y, image.width / 8, image.height / 8);
    };

    updateScore();
    if (opponentName !== null && opponentName !== "" && playerName !== null && playerName !== "")
    {
        console.log(opponentName + " vs " + playerName);
        playerInput.style.display = "none";
        gameContainer.style.display = "flex";
        
    }

    if (waitingMessage !== "") {
        context.font = "24px Arial";
        context.textAlign = "right";
        context.textBaseline = "middle";
        context.fillText(waitingMessage, canvas.width - 10, canvas.height / 2);
    }

    if (playerPlay !== null) {
        imagePlayerPlay(playerPlay);
        optionsPlay.style.display = "none";
    }
    if (opponentPlay !== null) {
        imageOpponentPlay(opponentPlay);
    }

    if (gameState === "played") {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = "24px Arial";
        context.textAlign = "right";
        context.textBaseline = "middle";
        context.fillText("Aguardando oponente...", canvas.width - 10, canvas.height / 2);
    } else if (playerPlay !== null && opponentPlay !== null && result !== null) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        updateScore()
        context.font = "30px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(`${playerName} : ${playerPlay} | ${opponentName}: ${opponentPlay}`, canvas.width / 2, canvas.height - 50);

        context.font = "45px Arial";
        context.fillText(result, canvas.width / 2, canvas.height / 3);
        context.fillStyle = "#DDD";
        context.fillRect(canvas.width / 2 - 75, playSize * 3, 150, 50);
        context.fillStyle = "black";
        optionsPlay.style.display = "none";

        resetButton.style.display = "block"; // Mostrar o botão "reset-button"
        waitingMessage = "";
    } else {
        resetButton.style.display = "none";
        optionsPlay.style.display = "flex";
        // Esconder o botão "reset-button"
    }
}

function makePlay(play) {
    if (playerPlay !== null) {
        return;
    }

    playerPlay = play;
    gameState = "played"; // atualiza o estado para "played"
    draw();
    socket.emit("play", playerPlay);
}

function resetGame() {
    playerPlay = null;
    opponentPlay = null;
    result = null;
    gameState = "waiting";

    draw();
    socket.emit("reset"); // Envie um sinal para redefinir o estado no servidor, se necessário
}

draw();
