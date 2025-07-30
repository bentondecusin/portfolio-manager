import { NextResponse, NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";
import { error } from "console";

// GET /api/holdings/[symbol]
export async function GET(request: NextRequest) {
  try {
    const sql = process.env.DATABASE_URL && neon(process.env.DATABASE_URL);
    if (!sql) throw error("failed to connect to neon");
    const row = await sql.query("SELECT * FROM holdings");
    return NextResponse.json(row);
  } catch (err) {
    console.error("Error fetching asset by symbol:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// POST /api/holdings/[symbol]
export async function POST(request: NextRequest) {
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
