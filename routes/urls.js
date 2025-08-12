// routes/urls.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const { v4: uuidv4 } = require("uuid");
const { z } = require("zod");

// Zod schemas
const UrlCreateSchema = z.object({
  name: z.string().min(1),
  mainUrl: z.string().min(1),
  subUrls: z.record(z.string(), z.string()).optional()
});

const UrlUpdateSchema = UrlCreateSchema;

// Health check
// In routes/urls.js health check
router.get("/health", async (req, res) => {
    try {
      console.log("Testing database connection...");
      const start = Date.now();
      const result = await db.query("SELECT 1 as test");
      const duration = Date.now() - start;
      
      console.log(`DB query successful in ${duration}ms`);
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        database: "connected",
        queryTime: `${duration}ms`,
        result: result.rows[0]
      });
    } catch (error) {
      console.error("Health check DB error:", error);
      res.status(500).json({
        status: "error",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error.message,
        code: error.code
      });
    }
  });

// Get all URLs (only non-deleted)
router.get("/api/urls", async (req, res) => {
  try {
    const q = `
      SELECT id, name, "mainUrl", "subUrls", "isDeleted", "createdAt", "updatedAt", "deletedAt"
      FROM urls
      WHERE "isDeleted" = false
      ORDER BY name ASC
    `;
    const result = await db.query(q);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching URLs:", error);
    res.status(500).json({ success: false, error: "Failed to fetch URLs" });
  }
});

// Get single URL by ID (only non-deleted)
router.get("/api/urls/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const q = `
      SELECT id, name, "mainUrl", "subUrls", "isDeleted", "createdAt", "updatedAt", "deletedAt"
      FROM urls
      WHERE id = $1 AND "isDeleted" = false
      LIMIT 1
    `;
    const result = await db.query(q, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "URL not found" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error fetching URL:", error);
    res.status(500).json({ success: false, error: "Failed to fetch URL" });
  }
});

// Create new URL
router.post("/api/urls", async (req, res) => {
  try {
    const parse = UrlCreateSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, error: parse.error.errors });
    }
    const { name, mainUrl, subUrls = {} } = parse.data;
    const id = uuidv4();
    const q = `
      INSERT INTO urls (id, name, "mainUrl", "subUrls", "isDeleted", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4::jsonb, false, NOW(), NOW())
      RETURNING id, name, "mainUrl", "subUrls", "isDeleted", "createdAt", "updatedAt", "deletedAt"
    `;
    const result = await db.query(q, [id, name, mainUrl, JSON.stringify(subUrls)]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error creating URL:", error);
    res.status(500).json({ success: false, error: "Failed to create URL" });
  }
});

// Update URL
router.put("/api/urls/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const parse = UrlUpdateSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, error: parse.error.errors });
    }
    const { name, mainUrl, subUrls = {} } = parse.data;

    // Check exists & not deleted
    const checkQ = `SELECT id FROM urls WHERE id = $1 AND "isDeleted" = false LIMIT 1`;
    const check = await db.query(checkQ, [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, error: "URL not found" });
    }

    const q = `
      UPDATE urls
      SET name = $1, "mainUrl" = $2, "subUrls" = $3::jsonb, "updatedAt" = NOW()
      WHERE id = $4
      RETURNING id, name, "mainUrl", "subUrls", "isDeleted", "createdAt", "updatedAt", "deletedAt"
    `;
    const result = await db.query(q, [name, mainUrl, JSON.stringify(subUrls), id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error updating URL:", error);
    res.status(500).json({ success: false, error: "Failed to update URL" });
  }
});

// Delete URL (soft delete)
router.delete("/api/urls/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const q = `
      UPDATE urls
      SET "isDeleted" = true, "deletedAt" = NOW()
      WHERE id = $1
      RETURNING id
    `;
    const result = await db.query(q, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "URL not found" });
    }
    res.json({ success: true, message: "URL deleted successfully" });
  } catch (error) {
    console.error("Error deleting URL:", error);
    res.status(500).json({ success: false, error: "Failed to delete URL" });
  }
});

module.exports = router;
