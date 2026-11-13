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

let activePool = null;
let connectingPromise = null;

async function getPool() {
  if (activePool && activePool.connected) {
    return activePool;
  }
  if (connectingPromise) {
    return connectingPromise;
  }

  connectingPromise = new sql.ConnectionPool(config)
    .connect()
    .then((pool) => {
      console.log("✅ MSSQL Database Connected Successfully to", config.database, "on", config.server);
      activePool = pool;
      connectingPromise = null;
      return pool;
    })
    .catch((err) => {
      console.error("❌ MSSQL Connection Attempt Failed:", err.message);
      connectingPromise = null;
      return null;
    });

  return connectingPromise;
}

// Initial connection attempt on startup
getPool();

// Thenable object that transparently satisfies `await poolPromise` across all controllers
const poolPromise = {
  then(resolve, reject) {
    return getPool().then(resolve, reject);
  },
  catch(reject) {
    return getPool().catch(reject);
  },
};

module.exports = {
  sql,
  poolPromise,
  getPool,
};
