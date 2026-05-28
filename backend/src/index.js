import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "projectflow-dev-secret-2024";
const JWT_EXPIRES_IN = "24h";

// ── Users Store ─────────────────────────────────────────────────────────────
const users = [
  {
    id: "u1",
    username: "admin",
    email: "admin@projectflow.io",
    name: "Admin User",
    avatar: "AD",
    color: "#7c3aed",
    passwordHash: bcrypt.hashSync("admin123", 10),
    role: "admin",
  },
  {
    id: "u2",
    username: "alex",
    email: "alex@projectflow.io",
    name: "Alex Rivera",
    avatar: "AR",
    color: "#6366f1",
    passwordHash: bcrypt.hashSync("alex123", 10),
    role: "member",
  },
  {
    id: "u3",
    username: "sam",
    email: "sam@projectflow.io",
    name: "Sam Chen",
    avatar: "SC",
    color: "#ec4899",
    passwordHash: bcrypt.hashSync("sam123", 10),
    role: "member",
  },
  {
    id: "u4",
    username: "jordan",
    email: "jordan@projectflow.io",
    name: "Jordan Lee",
    avatar: "JL",
    color: "#f59e0b",
    passwordHash: bcrypt.hashSync("jordan123", 10),
    role: "member",
  },
  {
    id: "u5",
    username: "taylor",
    email: "taylor@projectflow.io",
    name: "Taylor Kim",
    avatar: "TK",
    color: "#10b981",
    passwordHash: bcrypt.hashSync("taylor123", 10),
    role: "member",
  },
];

// ── Auth Middleware ──────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ── Auth Routes (public) ─────────────────────────────────────────────────────
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const user = users.find(
    (u) => u.username === username.toLowerCase() || u.email === username.toLowerCase()
  );

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      color: user.color,
      role: user.role,
    },
  });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    color: user.color,
    role: user.role,
  });
});

// ── Seed Data ──────────────────────────────────────────────────────────────
const members = [
  { id: "m1", name: "Alex Rivera",   avatar: "AR", color: "#6366f1" },
  { id: "m2", name: "Sam Chen",      avatar: "SC", color: "#ec4899" },
  { id: "m3", name: "Jordan Lee",    avatar: "JL", color: "#f59e0b" },
  { id: "m4", name: "Taylor Kim",    avatar: "TK", color: "#10b981" },
];

let columns = [
  { id: "col-1", title: "To Do",       color: "#6366f1", order: 0 },
  { id: "col-2", title: "In Progress", color: "#f59e0b", order: 1 },
  { id: "col-3", title: "In Review",   color: "#ec4899", order: 2 },
  { id: "col-4", title: "Done",        color: "#10b981", order: 3 },
];

let tasks = [];

// ── Protected Routes ─────────────────────────────────────────────────────────

// Members
app.get("/api/members", requireAuth, (_, res) => res.json(members));

app.post("/api/members", requireAuth, (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Name is required" });
  const words = name.trim().split(/\s+/);
  const avatar = words.map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const palette = ["#6366f1","#ec4899","#f59e0b","#10b981","#7c3aed","#00c6ff","#ff2d78","#06b6d4","#f97316","#84cc16"];
  const color = palette[members.length % palette.length];
  const member = { id: uuidv4(), name: name.trim(), avatar, color };
  members.push(member);
  res.status(201).json(member);
});

// Columns
app.get("/api/columns", requireAuth, (_, res) => res.json(columns.sort((a, b) => a.order - b.order)));

app.post("/api/columns", requireAuth, (req, res) => {
  const col = { id: uuidv4(), title: req.body.title, color: req.body.color || "#6366f1", order: columns.length };
  columns.push(col);
  res.status(201).json(col);
});

app.patch("/api/columns/:id", requireAuth, (req, res) => {
  const col = columns.find(c => c.id === req.params.id);
  if (!col) return res.status(404).json({ error: "Not found" });
  Object.assign(col, req.body);
  res.json(col);
});

app.delete("/api/columns/:id", requireAuth, (req, res) => {
  tasks = tasks.filter(t => t.columnId !== req.params.id);
  columns = columns.filter(c => c.id !== req.params.id);
  res.status(204).end();
});

// Tasks
app.get("/api/tasks", requireAuth, (req, res) => {
  let result = [...tasks];
  if (req.query.columnId)  result = result.filter(t => t.columnId === req.query.columnId);
  if (req.query.priority)  result = result.filter(t => t.priority === req.query.priority);
  if (req.query.assigneeId) result = result.filter(t => t.assigneeId === req.query.assigneeId);
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    result = result.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  }
  res.json(result.sort((a, b) => a.order - b.order));
});

app.post("/api/tasks", requireAuth, (req, res) => {
  const colTasks = tasks.filter(t => t.columnId === req.body.columnId);
  const task = { id: uuidv4(), order: colTasks.length, createdAt: new Date().toISOString(), tags: [], ...req.body };
  tasks.push(task);
  res.status(201).json(task);
});

app.patch("/api/tasks/:id", requireAuth, (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: "Not found" });
  Object.assign(task, req.body);
  res.json(task);
});

app.delete("/api/tasks/:id", requireAuth, (req, res) => {
  tasks = tasks.filter(t => t.id !== req.params.id);
  res.status(204).end();
});

// Drag-and-drop reorder
app.post("/api/tasks/reorder", requireAuth, (req, res) => {
  const { taskId, destinationColumnId, destinationIndex } = req.body;
  const task = tasks.find(t => t.id === taskId);
  if (!task) return res.status(404).json({ error: "Not found" });

  const oldColumnId = task.columnId;
  task.columnId = destinationColumnId;

  const srcTasks = tasks.filter(t => t.columnId === oldColumnId && t.id !== taskId).sort((a, b) => a.order - b.order);
  srcTasks.forEach((t, i) => (t.order = i));

  const dstTasks = tasks.filter(t => t.columnId === destinationColumnId && t.id !== taskId).sort((a, b) => a.order - b.order);
  dstTasks.splice(destinationIndex, 0, task);
  dstTasks.forEach((t, i) => (t.order = i));

  res.json({ success: true });
});

// Stats
app.get("/api/stats", requireAuth, (_, res) => {
  const total = tasks.length;
  const done  = tasks.filter(t => t.columnId === "col-4").length;
  const high  = tasks.filter(t => t.priority === "high").length;
  const byCol = columns.map(c => ({ id: c.id, title: c.title, count: tasks.filter(t => t.columnId === c.id).length, color: c.color }));
  res.json({ total, done, high, completionRate: total ? Math.round((done / total) * 100) : 0, byColumn: byCol });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅  ProjectFlow API running on http://localhost:${PORT}`));
