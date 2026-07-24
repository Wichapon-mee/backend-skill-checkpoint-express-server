import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const answersRouter = Router({ mergeParams: true });

const isValidAnswerContent = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  const trimmedContent = value.trim();
  return trimmedContent.length > 0 && trimmedContent.length <= 300;
};

answersRouter.get("/", async (req, res) => {
  const questionId = Number(req.params.questionId);

  if (!Number.isInteger(questionId) || questionId <= 0) {
    return res.status(404).json({ message: "Question not found." });
  }

  try {
    const questionResult = await connectionPool.query(
      "SELECT id FROM questions WHERE id = $1",
      [questionId]
    );

    if (questionResult.rows.length === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    const result = await connectionPool.query(
      "SELECT id, content FROM answers WHERE question_id = $1 ORDER BY id ASC",
      [questionId]
    );

    return res.status(200).json({ data: result.rows });
  } catch {
    return res.status(500).json({ message: "Unable to fetch answers." });
  }
});

answersRouter.post("/", async (req, res) => {
  const questionId = Number(req.params.questionId);
  const { content } = req.body;

  if (!Number.isInteger(questionId) || questionId <= 0) {
    return res.status(404).json({ message: "Question not found." });
  }

  if (!isValidAnswerContent(content)) {
    return res.status(400).json({ message: "Invalid request data." });
  }

  try {
    const questionResult = await connectionPool.query(
      "SELECT id FROM questions WHERE id = $1",
      [questionId]
    );

    if (questionResult.rows.length === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    await connectionPool.query(
      "INSERT INTO answers (question_id, content) VALUES ($1, $2)",
      [questionId, content.trim()]
    );

    return res.status(201).json({ message: "Answer created successfully." });
  } catch {
    return res.status(500).json({ message: "Unable to create answers." });
  }
});

answersRouter.delete("/", async (req, res) => {
  const questionId = Number(req.params.questionId);

  if (!Number.isInteger(questionId) || questionId <= 0) {
    return res.status(404).json({ message: "Question not found." });
  }

  try {
    const questionResult = await connectionPool.query(
      "SELECT id FROM questions WHERE id = $1",
      [questionId]
    );

    if (questionResult.rows.length === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    await connectionPool.query("DELETE FROM answers WHERE question_id = $1", [
      questionId,
    ]);

    return res.status(200).json({
      message: "All answers for the question have been deleted successfully.",
    });
  } catch {
    return res.status(500).json({ message: "Unable to delete answers." });
  }
});

export default answersRouter;
