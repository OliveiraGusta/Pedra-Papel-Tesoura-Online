const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const plays = ["Pedra", "Papel", "Tesoura"];

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Armazena as salas e os jogadores
const rooms = {};

// Inicializa o servidor WebSocket
io.on("connection", (socket) => {
  console.log(`Novo jogador conectado: ${socket.id}`);

  // Cria uma nova sala e adiciona o jogador
  let room = null;
  for (const roomId in rooms) {
    if (rooms[roomId].players.length < 2) {
      room = roomId;
      break;
    }
  }

  if (!room) {
    room = socket.id;
    rooms[room] = { players: [socket.id] };
  } else {
    rooms[room].players.push(socket.id);
  }

  // Envia as jogadas disponíveis para o novo jogador
  socket.emit("plays", plays);

// Função para determinar o resultado do jogo
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

// Quando um jogador faz uma jogada
socket.on("play", (play) => {
  console.log(`Jogada do jogador ${socket.id} na sala ${room}: ${play}`);

  const opponent = rooms[room].players.find((player) => player !== socket.id);
  if (!opponent) {
    return;
  }

  // Inicializa a estrutura de jogadas para a sala, se ainda não estiver inicializada
  if (!rooms[room].plays) {
    rooms[room].plays = {};
  }

  // Armazena a jogada do jogador
  rooms[room].plays[socket.id] = play;

  // Verifica se ambos os jogadores já fizeram suas jogadas
  const players = Object.keys(rooms[room].plays);
  if (players.length === 2) {
    const player1 = players[0];
    const player2 = players[1];

    const player1Play = rooms[room].plays[player1];
    const player2Play = rooms[room].plays[player2];

    // Verifica o resultado do jogo
    const resultPlayer1 = determineResult(player1Play, player2Play);
    const resultPlayer2 = determineResult(player2Play, player1Play);

    // Envia o resultado para cada jogador
    io.to(player1).emit("result", { player: player1Play, opponent: player2Play, result: resultPlayer1 });
    io.to(player2).emit("result", { player: player2Play, opponent: player1Play, result: resultPlayer2 });

    // Limpa as jogadas da sala
    delete rooms[room].plays[player1];
    delete rooms[room].plays[player2];
  }
});


  // Quando um jogador se desconecta
  socket.on("disconnect", () => {
    console.log(`Jogador desconectado: ${socket.id}`);

    // Remove o jogador da sala
    const playerIndex = rooms[room].players.indexOf(socket.id);
    if (playerIndex !== -1) {
      rooms[room].players.splice(playerIndex, 1);
    }

    // Se não houver mais jogadores na sala, remove a sala
    if (rooms[room].players.length === 0) {
      delete rooms[room];
    }
  });
});

const port = 80;
server.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
