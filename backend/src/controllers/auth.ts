import { Request, Response } from "express";
import prisma from "../prisma/client";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export async function registerController(req: Request, res: Response) {
  try {
    const { email, password, name, phone } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: "User already exists" });

    const hashed = await argon2.hash(password);

    let role = await prisma.role.findUnique({ where: { name: "student" } });
    if (!role) {
      role = await prisma.role.create({ data: { name: "student" } });
    }

    const user = await prisma.user.create({
      data: { email, password: hashed, name, phone, roleId: role.id },
    });

    return res.status(201).json({ id: user.id, email: user.email });
  } catch (err: any) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function loginController(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await argon2.verify(user.password, password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.id, role: user.role?.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role?.name,
      },
    });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
