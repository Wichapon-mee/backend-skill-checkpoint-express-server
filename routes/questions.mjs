import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import answersRouter from "./answers.mjs";

const questionsRouter = Router();

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

questionsRouter.post("/", async (req, res) => {
  const { title, description, category } = req.body;

  if (
    !isNonEmptyString(title) ||
    !isNonEmptyString(description) ||
    !isNonEmptyString(category)
  ) {
    return res.status(400).json({ message: "Invalid request data." });
  }

  try {
    await connectionPool.query(
      "INSERT INTO questions (title, description, category) VALUES ($1, $2, $3)",
      [title.trim(), description.trim(), category.trim()]
    );

    return res.status(201).json({ message: "Question created successfully." });
  } catch {
    return res.status(500).json({ message: "Unable to create question." });
  }
});

questionsRouter.get("/", async (req, res) => {
  try {
    const result = await connectionPool.query(
      "SELECT id, title, description, category FROM questions ORDER BY id ASC"
    );

    return res.status(200).json({ data: result.rows });
  } catch {
    return res.status(500).json({ message: "Unable to fetch questions." });
  }
});

questionsRouter.get("/search", async (req, res) => {
  const { title, category } = req.query;

  if (!isNonEmptyString(title) && !isNonEmptyString(category)) {
    return res.status(400).json({ message: "Invalid request data." });
  }

  try {
    const conditions = [];
    const values = [];

    if (isNonEmptyString(title)) {
      values.push(`%${title.trim()}%`);
      conditions.push(`title ILIKE $${values.length}`);
    }

    if (isNonEmptyString(category)) {
      values.push(`%${category.trim()}%`);
      conditions.push(`category ILIKE $${values.length}`);
    }

    const result = await connectionPool.query(
      `SELECT id, title, description, category FROM questions WHERE ${conditions.join(" AND ")} ORDER BY id ASC`,
      values
    );

    return res.status(200).json({ data: result.rows });
  } catch {
    return res.status(500).json({ message: "Unable to search questions." });
  }
});

questionsRouter.use("/:questionId/answers", answersRouter);

questionsRouter.get("/:questionId", async (req, res) => {
  try {
    const questionId = Number(req.params.questionId);

    if (!Number.isInteger(questionId) || questionId <= 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    const result = await connectionPool.query(
      "SELECT id, title, description, category FROM questions WHERE id = $1",
      [questionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    return res.status(200).json({ data: result.rows[0] });
  } catch {
    return res.status(500).json({ message: "Unable to fetch question." });
  }
});

questionsRouter.put("/:questionId", async (req, res) => {
  const questionId = Number(req.params.questionId);
  const { title, description, category } = req.body;

  if (!Number.isInteger(questionId) || questionId <= 0) {
    return res.status(404).json({ message: "Question not found." });
  }

  if (
    !isNonEmptyString(title) ||
    !isNonEmptyString(description) ||
    !isNonEmptyString(category)
  ) {
    return res.status(400).json({ message: "Invalid request data." });
  }

  try {
    const result = await connectionPool.query(
      "UPDATE questions SET title = $1, description = $2, category = $3 WHERE id = $4 RETURNING id",
      [title.trim(), description.trim(), category.trim(), questionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    return res.status(200).json({ message: "Question updated successfully." });
  } catch {
    return res.status(500).json({ message: "Unable to update question." });
  }
});

questionsRouter.delete("/:questionId", async (req, res) => {
  const questionId = Number(req.params.questionId);

  if (!Number.isInteger(questionId) || questionId <= 0) {
    return res.status(404).json({ message: "Question not found." });
  }

  try {
    const result = await connectionPool.query(
      "SELECT id FROM questions WHERE id = $1",
      [questionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    await connectionPool.query("DELETE FROM answers WHERE question_id = $1", [
      questionId,
    ]);

    await connectionPool.query("DELETE FROM questions WHERE id = $1", [
      questionId,
    ]);

    return res
      .status(200)
      .json({ message: "Question post has been deleted successfully." });
  } catch {
    return res.status(500).json({ message: "Unable to delete question." });
  }
});

export default questionsRouter;
