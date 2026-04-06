import prisma from "../prisma.js";

export const getRequests = async (req, res) => {
  const requests = await prisma.request.findMany();
  res.json(requests);
};

export const createRequest = async (req, res) => {
  const { name, email, message } = req.body;

  const newRequest = await prisma.request.create({
    data: {
      name,
      email,
      message
    }
  });

  res.json(newRequest);
};