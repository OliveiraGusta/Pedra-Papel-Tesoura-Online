const canvas = document.getElementById("game-canvas");
const context = canvas.getContext("2d");

const pedraButton = document.getElementById("pedra-option");
const papelButton = document.getElementById("papel-option");
const tesouraButton = document.getElementById("tesoura-option");

document.getElementById("set-name-button").addEventListener("click", setPlayerName);
const setNameButton = document.getElementById("set-name-button");
setNameButton.style.display = "block";

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

const optionsPlay = document.getElementById("options-play");
optionsPlay.style.display = "flex";

const resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", resetGame);
resetButton.style.display = "none"; // Esconder o botão inicialmente

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



function determineResult(player, opponent) {
    if (player === opponent) {
        return "Empate!";
    } else if (
        (player === "Pedra" && opponent === "Tesoura") ||
        (player === "Papel" && opponent === "Pedra") ||
        (player === "Tesoura" && opponent === "Papel")
    ) {
        return "Você ganhou!";
    } else {
        return "Você perdeu!";
    }
}

function setPlayerName() {
    playerName = prompt("Digite seu nome:");
    socket.emit("setPlayerName", playerName);
    setNameButton.style.display = "none";
    document.getElementById("namePlayer").innerHTML = playerName;
  }




function imagePlayerPlay(play) {
    const image = new Image();
    image.src = `images/${play}.png`;
    image.onload = function () {
        const x = (canvas.width - image.width / 2) / 4;
        const y = (canvas.height - image.height / 8) / 2;
        context.drawImage(image, x, y, image.width / 6, image.height / 6);
    };
}
function imageOpponentPlay(play) {
    const image = new Image();
    image.src = `images/${play}.png`;
    image.onload = function() {
        const x = canvas.width  - (image.width / 4) ;
        const y = (canvas.height - image.height / 8) / 2;
        context.drawImage(image, x, y, image.width / 6, image.height / 6);
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
        context.font = "30px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(`${playerName} : ${playerPlay} | Oponente: ${opponentPlay}`, canvas.width / 2, canvas.height - 20);
        
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

function drawWaitingMessage() {
    context.font = "24px Arial";
    context.textAlign = "center";
    context.fillText(waitingMessage, canvas.width / 2, playSize * 2);
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
