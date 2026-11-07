const sql = require("mssql");
require("dotenv").config();

const config = {
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "YourStrongPassword123!",
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_DATABASE || "MachineShop",
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("✅ MSSQL Database Connected Successfully to", config.database, "on", config.server);
    return pool;
  })
  .catch((err) => {
    console.error("❌ MSSQL Connection Failed! Make sure SQL Server is running:", err.message);
    return null;
  });

module.exports = {
  sql,
  poolPromise,
};
