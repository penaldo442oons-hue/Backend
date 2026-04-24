import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* ===============================
   GET ALL ADMINS
================================ */

export const getAdmins = async (req, res) => {
  try {
    const admins = await prisma.admin.findMany();
    res.json(admins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

/* ===============================
   CREATE ADMIN
================================ */

export const createAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await prisma.admin.create({
      data: {
        email,
        password
      }
    });

    res.json(admin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};