const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const plays = ["pedra", "papel", "tesoura"];

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Inicializa o servidor WebSocket
io.on("connection", (socket) => {
  console.log(`Novo jogador conectado: ${socket.id}`);

  // Envia as jogadas disponíveis para o novo jogador
  socket.emit("plays", plays);

  // Quando um jogador faz uma jogada
  socket.on("play", (play) => {
    console.log(`Jogada do jogador ${socket.id}: ${play}`);

    // Escolhe uma jogada aleatória para o oponente
    const opponentPlay = plays[Math.floor(Math.random() * plays.length)];

    let result = "";
    if (play === opponentPlay) {
      result = "Empate!";
    } else if (
      (play === "pedra" && opponentPlay === "tesoura") ||
      (play === "papel" && opponentPlay === "pedra") ||
      (play === "tesoura" && opponentPlay === "papel")
    ) {
      result = "Você ganhou!";
    } else {
      result = "Você perdeu!";
    }

    // Envia o resultado para o jogador
    socket.emit("result", {
      player: { id: socket.id, play },
      opponent: { play: opponentPlay },
      result,
    });
  });
});

// Iniciar o servidor
const PORT = 80;

server.listen(PORT, () => {
	if (PORT == 80) {
		console.log(`Servidor rodando na porta ${PORT} http://localhost`);
	} else {
		console.log(`Servidor rodando na porta ${PORT} http://localhost:${PORT}`);
	}
});

