const WebSocket = require("ws");
const { randomUUID } = require("crypto");

const PORT = process.env.WS_PORT ? Number(process.env.WS_PORT) : 8080;

const wss = new WebSocket.Server({ port: PORT });

// Keep a map of clients and their latest presence
const clients = new Map();

// In-memory storage for canvas elements (will persist while server runs)
const elements = [];

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

  const clientId = randomUUID();
  const name = generateRandomName();
  const color = generateRandomColor();
  clients.set(ws, { id: clientId, name, color, presence: null });

  // send current elements to the newly connected client
  try {
    ws.send(JSON.stringify({ type: "init", elements }));
  } catch (err) {}

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
      // accept client's supplied name/color (optional)
      const updated = { ...client, name: data.name ?? client.name, color: data.color ?? client.color };
      clients.set(ws, updated);
      // inform others about the new user (with null presence)
      broadcast(ws, { type: "user:joined", id: updated.id, name: updated.name, color: updated.color });
      // send current elements to the newly joined client
      const msg = JSON.stringify({ type: "elements:init", elements });
      ws.send(msg);      
    }

    if (data.type === "presence") {
      // presence updates can be null (hidden) or an object
      client.presence = data.cursor;
      clients.set(ws, client);
      // broadcast presence to others
      broadcast(ws, { type: "presence", id: client.id, cursor: data.cursor, name: client.name, color: client.color });
    }

    // Store canvas element creations
    if (data.type === "element:create" || data.type === "shape:create") {
      const payload = data.payload;
      if (!payload) return;
      const element = { createdAt: Date.now(), ...payload };
      elements.push(element);
      broadcast(ws, { type: "element:created", element });
    }    
    if (data.type === "element:modify") {
      const payload = data.payload;
      const index = elements.findIndex((el) => el.objectId === payload.objectId);
      if (index !== -1) {
        elements[index] = { ...elements[index], ...payload };
        broadcast(ws, { type: "element:modified", element: elements[index] });
      }
    }

    if (data.type === "element:delete") {
      const payload = data.payload;
      const index = elements.findIndex((el) => el.objectId === payload.objectId);
      if (index !== -1) {
        elements.splice(index, 1);
        broadcast(ws, { type: "element:deleted", objectId: payload.objectId });
      }
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
