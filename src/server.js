import express from "express";
import authRoutes from "./routes/auth.js";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "./middleware/authMiddleware.js";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);

app.put("/requests/:id/resolve", authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id);

  const request = await prisma.request.update({
    where: { id },
    data: { status: "resolved" }
  });

  res.json(request);
});

app.delete("/requests/:id", authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id);

  await prisma.request.delete({
    where: { id }
  });

  res.json({ message: "Request deleted" });
});

app.get("/", (req, res) => {
  res.json({ message: "API running 🚀" });
});

app.post("/request", async (req, res) => {
  const { name, email, message } = req.body;

  const request = await prisma.request.create({
    data: { name, email, message }
  });

  res.json(request);
});

app.get("/admin/dashboard", authenticateToken, async (req, res) => {
  const totalRequests = await prisma.request.count();

  const pendingRequests = await prisma.request.count({
    where: { status: "pending" }
  });

  const resolvedRequests = await prisma.request.count({
    where: { status: "resolved" }
  });

  const recentRequests = await prisma.request.findMany({
    orderBy: { createdAt: "desc" },
    take: 5
  });

  res.json({
    stats: {
      totalRequests,
      pendingRequests,
      resolvedRequests
    },
    recentRequests
  });
 });

app.get("/admin/stats", authenticateToken, async (req, res) => {
  const totalRequests = await prisma.request.count();

  const pendingRequests = await prisma.request.count({
    where: { status: "pending" }
  });

  const resolvedRequests = await prisma.request.count({
    where: { status: "resolved" }
  });

  const totalUsers = await prisma.user.count();

  res.json({
    totalRequests,
    pendingRequests,
    resolvedRequests,
    totalUsers
  });
});

app.get("/requests", authenticateToken, async (req, res) => {
  const requests = await prisma.request.findMany({
    orderBy: { createdAt: "desc" }
  });

  res.json(requests);
});

app.listen(5000, () => {
  console.log("Server running on port 5000 🚀");
});