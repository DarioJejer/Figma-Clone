const WebSocket = require("ws");

const PORT = process.env.WS_PORT ? Number(process.env.WS_PORT) : 8080;

const wss = new WebSocket.Server({ port: PORT });

// Keep a map of clients and their latest presence
const clients = new Map();

function broadcast(sender, payload) {
  const msg = JSON.stringify(payload);

  for (const [ws, client] of clients) {
    if (ws !== sender && ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  }
}

const adjectives = [
  "Happy",
  "Creative",
  "Energetic",
  "Lively",
  "Dynamic",
  "Radiant",
  "Joyful",
  "Vibrant",
  "Cheerful",
  "Sunny",
  "Sparkling",
  "Bright",
  "Shining",
];

const animals = [
  "Dolphin",
  "Tiger",
  "Elephant",
  "Penguin",
  "Kangaroo",
  "Panther",
  "Lion",
  "Cheetah",
  "Giraffe",
  "Hippopotamus",
  "Monkey",
  "Panda",
  "Crocodile",
];

function generateRandomName() {
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];

  return `${randomAdjective} ${randomAnimal}`;
}

function generateRandomColor() {
  const palette = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];
  return palette[Math.floor(Math.random() * palette.length)];
}



wss.on("connection", (ws) => {

  clients.set(ws, { id: crypto.randomUUID(), name: generateRandomName(), color: generateRandomColor(), presence: null });

  ws.on("message", (raw) => {
    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      return;
    }

    const client = clients.get(ws);
    if (!client) return;

    if (data.type === "join") {
      if (data.name && data.color){
        clients.set(ws, { name: data.name, color: data.color });        
      }
      // inform others about the new user (with null presence)
      broadcast(ws, { type: "user:joined", id: data.id, name: data.name, color: data.color });
    }

    if (data.type === "presence") {
      if (!data.cursor)
        return;
      client.presence = data.cursor;
      clients.set(ws, client);
      // broadcast presence to others
      broadcast(ws, { type: "presence", id: client.id, cursor: data.cursor, name: client.name, color: client.color });
    }

    if (data.type === "leave") {
      if (client) {
        broadcast(ws, { type: "user:left", id: client.id });
      }
    }
  });

  ws.on("close", () => {
    const client = clients.get(ws);
    if (client && client.id) {
      broadcast(ws, { type: "user:left", id: client.id });
    }
    clients.delete(ws);
  });
});

console.log(`WebSocket presence server running on ws://localhost:${PORT}`);
