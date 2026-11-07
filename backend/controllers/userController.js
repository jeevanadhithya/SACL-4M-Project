const { sql, poolPromise } = require("../db");
const bcrypt = require("bcrypt");

/**
 * 1. ADD USER
 */
exports.addUser = async (req, res) => {
  const { username, password, role, employeeId, department } = req.body;

  if (!username || !password || !role || !employeeId) {
    return res.status(400).json({ error: "Please provide username, employeeId, password, and role." });
  }

  try {
    const pool = await poolPromise;
    if (!pool) return res.status(503).json({ error: "Database connection unavailable." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const request = pool.request();
    request.input("username", sql.VarChar, username.trim());
    request.input("password", sql.VarChar, hashedPassword);
    request.input("role", sql.VarChar, role.trim().toLowerCase());
    request.input("employeeId", sql.VarChar, employeeId.trim());
    request.input("department", sql.VarChar, (department || "General").trim());

    await request.query(`
      INSERT INTO Users (username, password, role, employeeId, department)
      VALUES (@username, @password, @role, @employeeId, @department)
    `);

    return res.status(201).json({ message: "User added successfully!" });
  } catch (error) {
    console.error("Error adding user:", error);
    if (error.number === 2627) {
      return res.status(400).json({ error: "Username or Employee ID already exists!" });
    }
    return res.status(500).json({ error: "Failed to add user to database." });
  }
};

/**
 * 2. GET ALL USERS
 */
exports.getUsers = async (req, res) => {
  try {
    const pool = await poolPromise;
    if (!pool) return res.status(503).json({ error: "Database connection unavailable." });

    const result = await pool.request().query(`
      SELECT id, username, role, employeeId, department 
      FROM Users 
      ORDER BY id ASC
    `);
    return res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Failed to fetch users." });
  }
};

/**
 * 3. UPDATE USER
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, role, employeeId, department } = req.body;

    if (!username || !role || !employeeId) {
      return res.status(400).json({ error: "Username, employeeId, and role are required." });
    }

    const pool = await poolPromise;
    if (!pool) return res.status(503).json({ error: "Database connection unavailable." });

    const request = pool.request();
    request.input("id", sql.Int, parseInt(id, 10));
    request.input("username", sql.VarChar, username.trim());
    request.input("role", sql.VarChar, role.trim().toLowerCase());
    request.input("employeeId", sql.VarChar, employeeId.trim());
    request.input("department", sql.VarChar, (department || "General").trim());

    await request.query(`
      UPDATE Users 
      SET username = @username, role = @role, employeeId = @employeeId, department = @department 
      WHERE id = @id
    `);

    return res.status(200).json({ message: "User updated successfully!" });
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.number === 2627) {
      return res.status(400).json({ error: "Username or Employee ID already exists!" });
    }
    return res.status(500).json({ error: "Failed to update user." });
  }
};

/**
 * 4. DELETE USER
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    if (!pool) return res.status(503).json({ error: "Database connection unavailable." });

    const request = pool.request();
    request.input("id", sql.Int, parseInt(id, 10));
    await request.query("DELETE FROM Users WHERE id = @id");

    return res.status(200).json({ message: "User deleted successfully!" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ error: "Failed to delete user." });
  }
};
