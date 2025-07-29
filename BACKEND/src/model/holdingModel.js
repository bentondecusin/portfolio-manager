const db = require('../db');

// Fetch latest tick price inside SQL view (see schema.sql) or join manually
async function listLive() {
  const [rows] = await db.query('SELECT * FROM v_holding_live');
  return rows;
}

async function upsert({ assetId, quantity, avgCost, openedTs }) {
  // Simple “insert-or-update” by assetId
  await db.query(
    `INSERT INTO holding (asset_id, quantity, avg_cost, opened_ts)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       quantity = VALUES(quantity),
       avg_cost = VALUES(avg_cost)`,
    [assetId, quantity, avgCost, openedTs]
  );
}

module.exports = { listLive, upsert };
