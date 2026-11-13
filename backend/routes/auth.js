const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sql, poolPromise } = require("../db");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_2026";

/**
 * POST /api/auth/login
 * Body: { employeeId (or username), password }
 */
router.post("/login", async (req, res) => {
  const { employeeId, username, password } = req.body;
  const loginIdentifier = (employeeId || username || "").trim();

  if (!loginIdentifier || !password) {
    return res.status(400).json({ error: "Employee ID (or Username) and Password are required." });
  }

  try {
    const pool = await poolPromise;
    if (!pool) {
      return res.status(503).json({ error: "Database service unavailable. Please check SQL Server connection." });
    }

    const request = pool.request();
    request.input("identifier", sql.VarChar, loginIdentifier);

    const query = `
      SELECT TOP 1 id, username, password, role, employeeId, department 
      FROM Users 
      WHERE employeeId = @identifier OR username = @identifier
    `;

    const result = await request.query(query);
    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials. User not found." });
    }

    const storedHash = (user.password || "").trim();
    const isMatch = await bcrypt.compare(password, storedHash);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials. Password incorrect." });
    }

    const payload = {
      id: user.id,
      username: (user.username || "").trim(),
      role: (user.role || "").trim(),
      employeeId: (user.employeeId || "").trim(),
      department: (user.department || "").trim(),
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: payload,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Internal server error during authentication." });
  }
});

/**
 * POST /api/auth/register
 * Allows admin to register new employees/users
 */
router.post("/register", async (req, res) => {
  const { username, password, role, employeeId, department } = req.body;

  if (!username || !password || !employeeId) {
    return res.status(400).json({ error: "Username, password, and employee ID are required." });
  }

  try {
    const pool = await poolPromise;
    if (!pool) {
      return res.status(503).json({ error: "Database connection unavailable." });
    }

    // Check if user already exists
    const checkReq = pool.request();
    checkReq.input("empId", sql.VarChar, employeeId.trim());
    const existing = await checkReq.query("SELECT id FROM Users WHERE employeeId = @empId");

    if (existing.recordset.length > 0) {
      return res.status(409).json({ error: "User with this Employee ID already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertReq = pool.request();
    insertReq.input("username", sql.VarChar, username.trim());
    insertReq.input("password", sql.VarChar, hashedPassword);
    insertReq.input("role", sql.VarChar, (role || "operator").trim().toLowerCase());
    insertReq.input("employeeId", sql.VarChar, employeeId.trim());
    insertReq.input("department", sql.VarChar, (department || "General").trim());

    await insertReq.query(`
      INSERT INTO Users (username, password, role, employeeId, department)
      VALUES (@username, @password, @role, @employeeId, @department)
    `);

    return res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ error: "Failed to register user." });
  }
});

/**
 * GET /api/auth/me
 * Returns profile of logged-in user
 */
router.get("/me", verifyToken, (req, res) => {
  return res.status(200).json({ user: req.user });
});

/**
 * GET /api/auth/users
 * Returns list of users for assignment / CFT signature dropdowns
 */
router.get("/users", verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    if (!pool) return res.status(503).json({ error: "Database connection unavailable." });

    const roleFilter = req.query.role;
    let query = "SELECT id, username, role, employeeId, department FROM Users";

    const request = pool.request();
    if (roleFilter) {
      request.input("role", sql.VarChar, roleFilter.trim().toLowerCase());
      query += " WHERE LOWER(role) = @role";
    }
    query += " ORDER BY username ASC";

    const result = await request.query(query);
    return res.status(200).json({ users: result.recordset });
  } catch (error) {
    console.error("Fetch Users Error:", error);
    return res.status(500).json({ error: "Failed to fetch users." });
  }
});

/**
 * PUT /api/auth/users/:id
 * Admin updates a user's role or department
 */
router.put("/users/:id", verifyToken, requireRole("admin"), async (req, res) => {
  const { id } = req.params;
  const { username, role, employeeId, department } = req.body;

  try {
    const pool = await poolPromise;
    if (!pool) return res.status(503).json({ error: "Database connection unavailable." });

    const request = pool.request();
    request.input("id", sql.Int, parseInt(id, 10));
    request.input("username", sql.VarChar, (username || "").trim());
    request.input("role", sql.VarChar, (role || "operator").trim().toLowerCase());
    request.input("employeeId", sql.VarChar, (employeeId || "").trim());
    request.input("department", sql.VarChar, (department || "General").trim());

    await request.query(`
      UPDATE Users
      SET username = @username,
          role = @role,
          employeeId = @employeeId,
          department = @department
      WHERE id = @id
    `);

    return res.status(200).json({ message: "User updated successfully!" });
  } catch (error) {
    console.error("Update User Error:", error);
    return res.status(500).json({ error: "Failed to update user." });
  }
});

/**
 * DELETE /api/auth/users/:id
 * Admin deletes a user
 */
router.delete("/users/:id", verifyToken, requireRole("admin"), async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    if (!pool) return res.status(503).json({ error: "Database connection unavailable." });

    const request = pool.request();
    request.input("id", sql.Int, parseInt(id, 10));
    await request.query("DELETE FROM Users WHERE id = @id");

    return res.status(200).json({ message: "User deleted successfully!" });
  } catch (error) {
    console.error("Delete User Error:", error);
    return res.status(500).json({ error: "Failed to delete user." });
  }
});

module.exports = router;
