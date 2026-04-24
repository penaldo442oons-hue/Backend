import "./loadEnv.js";
import express from "express";
import cors from "cors";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { runWorkspaceModel, isAiConfigured, getResolvedAiProvider } from "./lib/aiService.js";

const app = express();

app.use(cors());
app.use(express.json());

/* Request logging */
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const DATA_FILE = "./src/data/requests.json";
const USERS_FILE = "./src/data/users.json";

const DEMO_DURATION_MS = Number(process.env.DEMO_DURATION_MS) || 7 * 24 * 60 * 60 * 1000;

/* Load requests */
let requests = [];

try {
  const data = fs.readFileSync(DATA_FILE);
  requests = JSON.parse(data);
} catch (err) {
  console.log("No existing data found. Starting fresh.");
  requests = [];
}

/* Load users */
let users = [];

try {
  const rawUsers = fs.readFileSync(USERS_FILE);
  users = JSON.parse(rawUsers);
} catch {
  users = [];
}

/* Save helpers */
const saveRequests = () => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(requests, null, 2));
};

const saveUsers = () => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

const findUserByEmail = (email) =>
  users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());

const userHasAiAccess = (user) => {
  if (!user) return false;
  if (user.subscriptionPlan === "starter" || user.subscriptionPlan === "pro") {
    return true;
  }
  if (user.subscriptionPlan === "trial" && user.trialEndsAt > Date.now()) {
    return true;
  }
  return false;
};

/* =========================
   ADMIN LOGIN CONFIG
========================= */

const ADMIN_USER = "admin";

/* hashed password for: admin123 */
const ADMIN_PASSWORD_HASH =
  "$2b$10$qMq7wh6Qslymqltbc1jwDugh0ZUU1elcr9qSSchlAnxgZ9WFyBx9.";

const SECRET = process.env.JWT_SECRET || "supersecretkey";

const issueUserToken = (user) =>
  jwt.sign(
    {
      type: "user",
      email: user.email,
      subscriptionPlan: user.subscriptionPlan,
      trialEndsAt: user.trialEndsAt,
    },
    SECRET,
    { expiresIn: "30d" }
  );

/* JWT Middleware — admin routes */

const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);

    if (decoded.type === "user") {
      return res.status(403).json({
        error: "Invalid token for admin",
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      error: "Invalid token",
    });
  }
};

const verifyUserToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);

    if (decoded.type !== "user") {
      return res.status(403).json({
        error: "Invalid user token",
      });
    }

    req.userJwt = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      error: "Invalid token",
    });
  }
};

/* =========================
   ROUTES
========================= */

/* API test */
app.get("/", (req, res) => {
  res.send("API running");
});

/* ADMIN LOGIN */
app.post("/admin/login", async (req, res) => {

  const { username, password } = req.body;

  if (username !== ADMIN_USER) {
    return res.status(401).json({
      error: "Invalid credentials"
    });
  }

  const validPassword = await bcrypt.compare(
    password,
    ADMIN_PASSWORD_HASH
  );

  if (!validPassword) {
    return res.status(401).json({
      error: "Invalid credentials"
    });
  }

  const token = jwt.sign(
    { type: "admin", username },
    SECRET,
    { expiresIn: "8h" }
  );

  res.json({
    token
  });

});

/* USER AUTH */

app.post("/auth/register", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required",
    });
  }

  if (findUserByEmail(email)) {
    return res.status(409).json({
      error: "Email already registered",
    });
  }

  const passwordHash = await bcrypt.hash(String(password), 10);
  const normalizedEmail = String(email).trim().toLowerCase();

  const user = {
    id: Date.now(),
    email: normalizedEmail,
    name: String(name || "").trim() || "User",
    passwordHash,
    subscriptionPlan: "trial",
    trialEndsAt: Date.now() + DEMO_DURATION_MS,
    createdAt: Date.now(),
  };

  users.push(user);
  saveUsers();

  const token = issueUserToken(user);

  res.json({
    token,
    user: {
      email: user.email,
      name: user.name,
      subscriptionPlan: user.subscriptionPlan,
      trialEndsAt: user.trialEndsAt,
    },
  });
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required",
    });
  }

  const user = findUserByEmail(email);

  if (!user) {
    return res.status(401).json({
      error: "Invalid credentials",
    });
  }

  const validPassword = await bcrypt.compare(String(password), user.passwordHash);

  if (!validPassword) {
    return res.status(401).json({
      error: "Invalid credentials",
    });
  }

  const token = issueUserToken(user);

  res.json({
    token,
    user: {
      email: user.email,
      name: user.name,
      subscriptionPlan: user.subscriptionPlan,
      trialEndsAt: user.trialEndsAt,
    },
  });
});

app.get("/auth/me", verifyUserToken, (req, res) => {
  const user = findUserByEmail(req.userJwt.email);

  if (!user) {
    return res.status(404).json({
      error: "User not found",
    });
  }

  res.json({
    email: user.email,
    name: user.name,
    subscriptionPlan: user.subscriptionPlan,
    trialEndsAt: user.trialEndsAt,
    hasAiAccess: userHasAiAccess(user),
  });
});

app.post("/auth/select-plan", verifyUserToken, (req, res) => {
  const { plan } = req.body;

  if (plan !== "starter" && plan !== "pro") {
    return res.status(400).json({
      error: "Invalid plan",
    });
  }

  const user = findUserByEmail(req.userJwt.email);

  if (!user) {
    return res.status(404).json({
      error: "User not found",
    });
  }

  user.subscriptionPlan = plan;
  saveUsers();

  const token = issueUserToken(user);

  res.json({
    token,
    user: {
      email: user.email,
      subscriptionPlan: user.subscriptionPlan,
      trialEndsAt: user.trialEndsAt,
    },
  });
});

/* ADMIN STATS (PROTECTED) */

app.get("/admin/stats", verifyAdminToken, (req, res) => {

  const total = requests.length;

  const pending = requests.filter(
    r => r.status === "pending"
  ).length;

  const resolved = requests.filter(
    r => r.status === "resolved"
  ).length;

  res.json({
    total,
    pending,
    resolved
  });

});

/* GET REQUESTS */

app.get("/requests", (req, res) => {

  const page = Math.max(1, Number(req.query.page) || 1);
  const rawLimit = Number(req.query.limit);
  const limit = Math.min(Math.max(rawLimit || 500, 1), 2000);

  let filtered = [...requests];

  if (req.query.status) {
    filtered = filtered.filter(
      r => r.status === req.query.status
    );
  }

  filtered.sort(
    (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
  );

  const start = (page - 1) * limit;
  const end = start + limit;

  const paginated = filtered.slice(start, end);

  res.json({
    total: filtered.length,
    page,
    limit,
    data: paginated
  });

});

/* CREATE REQUEST */

app.post("/requests", (req, res) => {

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      error: "All fields are required"
    });
  }

  const duplicate = requests.find(
    r => r.email === email && r.message === message
  );

  if (duplicate) {
    return res.status(409).json({
      error: "Duplicate request"
    });
  }

  const newRequest = {
    id: Date.now(),
    ticket: `REQ-${Date.now()}`,
    name,
    email,
    message,
    status: "pending",
    createdAt: Date.now()
  };

  requests.push(newRequest);

  saveRequests();

  res.json(newRequest);

});

/* RESOLVE REQUEST */

app.put("/requests/:id/resolve", (req, res) => {

  const id = Number(req.params.id);

  const request = requests.find(
    r => r.id === id
  );

  if (!request) {
    return res.status(404).json({
      error: "Request not found"
    });
  }

  request.status = "resolved";

  saveRequests();

  res.json(request);

});

/* MARK REQUEST PENDING */

app.put("/requests/:id/pending", (req, res) => {

  const id = Number(req.params.id);

  const request = requests.find(
    r => r.id === id
  );

  if (!request) {
    return res.status(404).json({
      error: "Request not found"
    });
  }

  request.status = "pending";

  saveRequests();

  res.json(request);

});

/* DELETE REQUEST */

app.delete("/requests/:id", (req, res) => {

  const id = Number(req.params.id);

  const requestExists = requests.find(
    r => r.id === id
  );

  if (!requestExists) {
    return res.status(404).json({
      error: "Request not found"
    });
  }

  requests = requests.filter(
    r => r.id !== id
  );

  saveRequests();

  res.json({
    message: "Request deleted"
  });

});

/* =========================
   AI SYSTEM ENDPOINTS
   (Added without modifying existing logic)
========================= */

/* AI TASK SUBMISSION */

app.post("/ai/request", (req, res) => {

  const { prompt, user } = req.body;

  if (!prompt) {
    return res.status(400).json({
      error: "Prompt is required"
    });
  }

  const task = {
    id: Date.now(),
    type: "ai",
    user: user || "anonymous",
    prompt,
    status: "processing",
    retries: 0,
    createdAt: Date.now()
  };

  requests.push(task);

  saveRequests();

  res.json(task);

});

/* AI CHAT (workspace — real model) */

app.post("/ai/chat", verifyUserToken, async (req, res) => {
  const user = findUserByEmail(req.userJwt.email);

  if (!user) {
    return res.status(404).json({
      error: "User not found",
    });
  }

  if (!userHasAiAccess(user)) {
    return res.status(403).json({
      error: "DEMO_EXPIRED",
      message: "Your demo has ended. Choose a subscription to keep using AI.",
      trialEndsAt: user.trialEndsAt,
    });
  }

  if (!isAiConfigured()) {
    return res.status(503).json({
      error: "AI_NOT_CONFIGURED",
      message:
        "Set AI_PROVIDER to anthropic, openai, or gemini and set the matching API key (ANTHROPIC_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY).",
    });
  }

  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: "messages array is required",
    });
  }

  const clean = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant"))
    .map((m) => ({
      role: m.role,
      content: String(m.content || ""),
    }))
    .filter((m) => m.content.length > 0);

  if (clean.length === 0) {
    return res.status(400).json({
      error: "No valid messages",
    });
  }

  try {
    const structured = await runWorkspaceModel(clean);

    const lastUser = [...clean].reverse().find((m) => m.role === "user");

    const task = {
      id: Date.now(),
      type: "ai",
      user: user.email,
      prompt: (lastUser?.content || "").slice(0, 2000),
      status: "completed",
      retries: 0,
      createdAt: Date.now(),
    };

    requests.push(task);
    saveRequests();

    res.json(structured);
  } catch (err) {
    console.error("ai/chat", err);

    res.status(502).json({
      error: "AI_REQUEST_FAILED",
      message: err.message || "Model request failed",
    });
  }
});

/* AI RETRY */

app.put("/ai/:id/retry", (req, res) => {

  const id = Number(req.params.id);

  const task = requests.find(r => r.id === id);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  task.retries += 1;

  if (task.retries >= 3) {
    task.status = "needs-admin";
  }

  saveRequests();

  res.json(task);

});

/* ESCALATE TO ADMIN */

app.put("/ai/:id/escalate", (req, res) => {

  const id = Number(req.params.id);

  const task = requests.find(r => r.id === id);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  task.status = "admin-review";

  saveRequests();

  res.json(task);

});

/* ADMIN AVAILABILITY */

let adminStatus = {
  available: true,
  unavailableUntil: null
};

app.get("/admin/availability", (req, res) => {
  res.json(adminStatus);
});

app.put("/admin/availability", verifyAdminToken, (req, res) => {

  const { available, unavailableUntil } = req.body;

  adminStatus.available = available;
  adminStatus.unavailableUntil = unavailableUntil || null;

  res.json(adminStatus);

});

/* GLOBAL ERROR HANDLER */

app.use((err, req, res, next) => {

  console.error(err.stack);

  res.status(500).json({
    error: "Something went wrong"
  });

});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  const aiProv = getResolvedAiProvider();
  const aiOk = isAiConfigured();
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(
    `[AI] provider=${aiProv} key_loaded=${aiOk ? "yes" : "no"} (if key_loaded is no, check Backend/.env and restart)`
  );
});