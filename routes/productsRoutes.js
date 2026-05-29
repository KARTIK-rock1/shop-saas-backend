import express, { Router } from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { shop_id } = req.query;

    const result = await pool.query(
      "SELECT * FROM products WHERE shop_id = $1 ORDER BY id DESC ",
      [shop_id]
    )

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to get products",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, price, shop_id } = req.body;

    const result = await pool.query(
      "INSERT INTO products (name, price, shop_id) VALUES ($1, $2, $3) RETURNING * ",
      [name, price, shop_id],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to add products",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, price } = req.body;

    const result = await pool.query(
      "UPDATE products SET name=$1, price=$2 WHERE id=$3 RETURNING * ",
      [name, price, req.params.id],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to update",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM products WHERE id=$1", [req.params.id]);

    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to delete",
    });
  }
});

export default router;
