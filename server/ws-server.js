const WebSocket = require("ws");
const { randomUUID } = require("crypto");

const PORT = process.env.WS_PORT ? Number(process.env.WS_PORT) : 8080;

const wss = new WebSocket.Server({ port: PORT });

// Keep a map of clients and their latest presence
const clients = new Map();

// Map of roomId (string) -> Map of WebSocket -> client object
const rooms = new Map();

// Per-room canvas element storage: roomId -> array of elements
const elementsByRoom = new Map();

function getElementsForRoom(roomId) {
  const key = String(roomId);
  return elementsByRoom.get(key) ?? [];
}

function addElementToRoom(roomId, element) {
  const key = String(roomId);
  let arr = elementsByRoom.get(key);
  if (!arr) {
    arr = [];
    elementsByRoom.set(key, arr);
  }
  arr.push(element);
}

function modifyElementInRoom(roomId, payload) {
  const key = String(roomId);
  const arr = elementsByRoom.get(key);
  if (!arr) return null;
  const index = arr.findIndex((el) => el.objectId === payload.objectId);
  if (index === -1) return null;
  arr[index] = { ...arr[index], ...payload };
  return arr[index];
}

function deleteElementFromRoom(roomId, objectId) {
  const key = String(roomId);
  const arr = elementsByRoom.get(key);
  if (!arr) return false;
  const index = arr.findIndex((el) => el.objectId === objectId);
  if (index === -1) return false;
  arr.splice(index, 1);
  return true;
}

function clearElementsInRoom(roomId) {
  const key = String(roomId);
  elementsByRoom.set(key, []);
}

// Helper function to broadcast only to clients in the same room
function broadcastToRoom(sender, payload, roomId) {
  const msg = JSON.stringify(payload);
  const roomMap = rooms.get(String(roomId));
  if (!roomMap) return;
  for (const [ws] of roomMap) {
    try {
      if (ws !== sender && ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
      }
    } catch (e) {
      // ignore
    }
  }
}

// Helper function to get users in a specific room
function getUsersInRoom(roomId, currentWs) {
  const users = [];
  const roomMap = rooms.get(String(roomId));
  if (!roomMap) return users;
  for (const [ws] of roomMap) {
    const client = clients.get(ws);
    if (client && client.id && ws !== currentWs) users.push({ id: client.id, name: client.name, color: client.color });
  }
  return users;
}

function addClientToRoom(ws, roomId) {
  const key = String(roomId);
  let roomMap = rooms.get(key);
  if (!roomMap) {
    roomMap = new Map();
    rooms.set(key, roomMap);
  }
  const clientObj = clients.get(ws);
  roomMap.set(ws, clientObj);
}

function removeClientFromRoom(ws, roomId) {
  const key = String(roomId);
  const roomMap = rooms.get(key);
  if (!roomMap) return;
  roomMap.delete(ws);
  if (roomMap.size === 0) rooms.delete(key);
}

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
  clients.set(ws, { id: clientId, name, color, presence: null, roomId: null });

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
      const roomId = data.roomId ?? 1;
      const roomKey = String(roomId);
      const updated = { ...client, name: data.name ?? client.name, color: data.color ?? client.color, roomId: roomKey };
      clients.set(ws, updated);
      // add client to room set
      addClientToRoom(ws, roomKey);
      // inform others in the same room about the new user
      broadcastToRoom(ws, { type: "user:joined", id: updated.id, name: updated.name, color: updated.color }, roomKey);
      // send current elements to the newly joined client
      try {
        const roomElements = getElementsForRoom(roomKey);
        ws.send(JSON.stringify({ type: "elements:init", elements: roomElements }));
      } catch (err) {
        console.error("Error sending elements:init:", err);
      }

      // send current connected users to the newly connected client so they can seed presence list
      try {
        const users = getUsersInRoom(roomKey, ws);
        ws.send(JSON.stringify({ type: "users:init", users }));
      } catch (e) {
        console.error("Error sending users:init:", e);
      }
    }

    if (data.type === "room:switch") {
      const oldRoomKey = client.roomId;
      const newRoomKey = String(data.roomId ?? 1);
      if (oldRoomKey) {
        removeClientFromRoom(ws, oldRoomKey);
        broadcastToRoom(ws, { type: "user:left", id: client.id }, oldRoomKey);
      }

      const updated = { ...client, roomId: newRoomKey };
      clients.set(ws, updated);
      addClientToRoom(ws, newRoomKey);

      broadcastToRoom(ws, { type: "user:joined", id: updated.id, name: updated.name, color: updated.color }, newRoomKey);

      try {
        const users = getUsersInRoom(newRoomKey, ws);
        ws.send(JSON.stringify({ type: "users:init", users }));
        const roomElements = getElementsForRoom(newRoomKey);
        ws.send(JSON.stringify({ type: "elements:init", elements: roomElements }));
      } catch (e) {
        console.error("Error sending users/init or elements:init after room switch:", e);
      }
    }

    if (data.type === "presence") {
      // presence updates can be null (hidden) or an object
      client.presence = data.cursor;
      clients.set(ws, client);
      // broadcast presence to others in the same room
      broadcastToRoom(ws, { type: "presence", id: client.id, cursor: data.cursor, name: client.name, color: client.color }, client.roomId);
    }

    if (data.type === "user:update") {
      // allow clients to update their profile (name / color / email)
      const updated = { ...client, name: data.name ?? client.name, color: data.color ?? client.color };
      clients.set(ws, updated);
      // also update room map entry if present so getUsersInRoom is fresh
      try {
        const roomKey = updated.roomId;
        if (roomKey) {
          const rm = rooms.get(String(roomKey));
          if (rm) rm.set(ws, updated);
        }
      } catch (e) {
        // ignore
      }
      // broadcast the updated profile to others in the same room
      broadcastToRoom(ws, { type: "user:updated", id: updated.id, name: updated.name, color: updated.color }, client.roomId);
    }

    // Store canvas element creations (room-scoped)
    if (data.type === "element:create" || data.type === "shape:create") {
      const payload = data.payload;
      if (!payload) return;
      const element = { createdAt: Date.now(), ...payload };
      const roomKey = client.roomId ?? "1";
      addElementToRoom(roomKey, element);
      broadcastToRoom(ws, { type: "element:created", element }, roomKey);
    }
    if (data.type === "element:modify") {
      const payload = data.payload;
      const roomKey = client.roomId ?? "1";
      const updated = modifyElementInRoom(roomKey, payload);
      if (updated) {
        broadcastToRoom(ws, { type: "element:modified", element: updated }, roomKey);
      }
    }

    if (data.type === "element:delete") {
      const payload = data.payload;
      const roomKey = client.roomId ?? "1";
      const ok = deleteElementFromRoom(roomKey, payload.objectId);
      if (ok) {
        broadcastToRoom(ws, { type: "element:deleted", objectId: payload.objectId }, roomKey);
      }
    }

    if (data.type === "element:delete_all") {
      const roomKey = client.roomId ?? "1";
      clearElementsInRoom(roomKey);
      broadcastToRoom(ws, { type: "elements:cleared" }, roomKey);
    }

    if (data.type === "user:leave") {
      if (client) {
        broadcastToRoom(ws, { type: "user:left", id: client.id }, client.roomId);
        removeClientFromRoom(ws, client.roomId);
      }
    }
  });

  ws.on("close", () => {
    const client = clients.get(ws);
    if (client && client.id) {
      broadcastToRoom(ws, { type: "user:left", id: client.id }, client.roomId);
      removeClientFromRoom(ws, client.roomId);
    }
    clients.delete(ws);
  });
});

console.log(`WebSocket presence server running on ws://localhost:${PORT}`);
