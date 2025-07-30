import { NextResponse, NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";
import { error } from "console";

// GET /api/balance
export async function GET(request: NextRequest) {
  try {
    const sql = process.env.DATABASE_URL && neon(process.env.DATABASE_URL);
    if (!sql) throw error("failed to connect to neon");
    const row = await sql.query(
      "SELECT quantity FROM holdings WHERE symbol='CASH' OR symbol='USD'"
    );
    return NextResponse.json({ balance: row[0]["quantity"] });
  } catch (err) {
    console.error("Error fetching asset by symbol:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// POST /api/holdings/[symbol]
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    console.log(data);

    // const sym = symbol.toUpperCase();
    const sql = process.env.DATABASE_URL && neon(process.env.DATABASE_URL);
    if (!sql) throw error("failed to connect to neon");
    const row = await sql.query(`SELECT * FROM holdings WHERE symbol='${sym}'`);

    if (row && row.length == 0) {
      return NextResponse.json({ asset: sym, holding: 0 });
    }
    return NextResponse.json({ asset: sym, holding: row[0].holding_amount });
  } catch (err) {
    console.error("Error fetching asset by symbol:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
