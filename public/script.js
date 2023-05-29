const canvas = document.getElementById("game-canvas");
const context = canvas.getContext("2d");

let plays = [];
let playerPlay = null;
let opponentPlay = null;
let result = null;
let gameState = "waiting";
let waitingMessage = "";
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



function draw() {
    const playSize = canvas.width / 3;
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < plays.length; i++) {
        context.fillStyle = "#DDD";
        context.fillRect(i * playSize, 0, playSize, playSize);
        context.fillStyle = "black";
        context.font = "48px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(plays[i], i * playSize + playSize / 2, playSize / 2);
    }
    if (waitingMessage !== "") {
        context.font = "24px Arial";
        context.textAlign = "right";
        context.textBaseline = "middle";
        context.fillText(waitingMessage, canvas.width - 10, canvas.height / 2);
    }

    if (gameState === "played") {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = "24px Arial";
        context.textAlign = "right";
        context.textBaseline = "middle";
        context.fillText("Aguardando oponente...", canvas.width - 10, canvas.height / 2);

    } else if (playerPlay !== null && opponentPlay !== null && result !== null) {

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = "24px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(`Você: ${playerPlay} | Oponente: ${opponentPlay}`, canvas.width / 2, canvas.height / 1.7);

        context.fillText(result, canvas.width / 2, canvas.height / 2.5);
        context.fillStyle = "#DDD";
        context.fillRect(canvas.width / 2 - 75, playSize * 3, 150, 50);
        context.fillStyle = "black";

        resetButton.style.display = "block"; // Mostrar o botão "reset-button"
        waitingMessage = "";

    } else {
        resetButton.style.display = "none"; // Esconder o botão "reset-button"
    }
}

function drawWaitingMessage() {
    context.font = "24px Arial";
    context.textAlign = "center";
    context.fillText(waitingMessage, canvas.width / 2, playSize * 2);
}

canvas.addEventListener("click", (event) => {
    if (playerPlay !== null) {
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const playSize = canvas.width / 3;

    if (y > playSize) {
        return;
    }

    const playIndex = Math.floor(x / playSize);
    playerPlay = plays[playIndex];
    gameState = "played"; // atualiza o estado para "played"
    draw();
    socket.emit("play", playerPlay);
});

canvas.addEventListener("click", handleResetClick);

function handleResetClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const playSize = canvas.width / 3;

    if (
        y > playSize * 3 &&
        y < playSize * 3 + 50 &&
        x > canvas.width / 2 - 75 &&
        x < canvas.width / 2 + 75
    ) {
        resetGame();
    }
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
