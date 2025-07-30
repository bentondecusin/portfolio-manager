import { neon } from "@neondatabase/serverless";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  let qry = "SELECT * FROM transactions ";
  const { searchParams } = request.nextUrl;
  if (searchParams) {
    const { name, symbol } = searchParams;
    if (symbol) {
      qry += `WHERE symbol='${symbol}'`;
    } else if (name) {
      qry += `WHERE tick_name LIKE '%${name}%'`;
    }
  }

  const sql = process.env.DATABASE_URL && neon(process.env.DATABASE_URL);
  if (!sql) throw Error("failed to connect to neon");

  const rows = await sql.query(qry);
  if (!rows) {
    return NextResponse.json(
      { error: "Failed to fetch historic transactions" },
      { status: 500 }
    );
  }
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const sql = process.env.DATABASE_URL && neon(process.env.DATABASE_URL);
  if (!sql) throw Error("failed to connect to neon");
  try {
    const data = await request.json();
    const { symbol, txnType, quantity, price } = data;
    const signed_quantity = txnType == "buy" ? quantity : -quantity;
    // Start transaction
    await sql.query("BEGIN");
    // Add Tx Record for update asset
    await sql.query(
      `INSERT INTO transactions (symbol, txn_type, quantity, price, txn_ts) VALUES ('${symbol}',  '${
        txnType == "buy" ? "Buy" : "Sell"
      }', '${quantity}', '${price}', NOW());`
    );
    // Add Tx Record for updating cash
    await sql.query(
      `INSERT INTO transactions (symbol, txn_type, quantity, price, txn_ts ) VALUES ('CASH', '${
        txnType == "buy" ? "Sell" : "Buy"
      }' , '${quantity}', ${signed_quantity * price} , NOW());`
    );

    // Update asset holding record
    await sql.query(`
        INSERT INTO holdings (symbol, holding_amount)
        VALUES ('${symbol}', ${signed_quantity})
        ON CONFLICT (symbol)
        DO UPDATE SET holding_amount = holdings.holding_amount + ${signed_quantity};`);
    // Update cash holding record
    await sql.query(`
        INSERT INTO holdings (symbol, holding_amount)
        VALUES ('CASH', ${-signed_quantity * price})
        ON CONFLICT (symbol)
        DO UPDATE SET holding_amount = holdings.holding_amount + ${
          -signed_quantity * price
        };`);
    await sql.query("COMMIT");
    return NextResponse.json({ message: "Trade filled" }, { status: 200 });
  } catch (error) {
    await sql.query("ROLLBACK");
    console.error("Error", error);
    return NextResponse.json({ message: "Trade not filled" }, { status: 500 });
  }
}
