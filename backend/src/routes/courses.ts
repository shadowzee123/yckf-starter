import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Courses route working" });
});

export default router;