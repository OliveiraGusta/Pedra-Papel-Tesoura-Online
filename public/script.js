const canvas = document.getElementById("game-canvas");
const context = canvas.getContext("2d");

let plays = [];
let playerPlay = null;
let opponentPlay = null;
let result = null;

const socket = io();
socket.on("plays", (availablePlays) => {
    plays = availablePlays;
    draw();
});

socket.on("result", (data) => {
    playerPlay = data.player;
    opponentPlay = data.opponent;
    result = determineResult(playerPlay, opponentPlay);
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

    if (playerPlay !== null && opponentPlay !== null && result !== null) {
        context.font = "24px Arial";
        context.textAlign = "center";
        context.fillText(`Você: ${playerPlay} | Oponente: ${opponentPlay}`, canvas.width / 2, playSize * 2);
        context.fillText(result, canvas.width / 2, playSize * 3);
    }
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
    socket.emit("play", playerPlay);
});

draw();