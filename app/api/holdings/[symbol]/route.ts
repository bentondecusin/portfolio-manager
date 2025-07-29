import { NextResponse, NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";
import { error } from "console";

interface Asset {
  symbol: string;
  name: string;
  price: number;
  date: string;
  class: string;
}

// GET /api/holdings/:cash
export async function GET(request: NextRequest, params: { symbol: string }) {
  try {
    params = await params;
    const sym = params!.symbol!.toUpperCase();
    return NextResponse.json({ symbol: params.symbol, amount: 1000 });
    const sql = process.env.DATABASE_URL && neon(process.env.DATABASE_URL);
    if (!sql) throw error("failed to connect to neon");
    const [row] = await sql.query(
      `SELECT symbol, name, price, date, class
       FROM assets
       WHERE symbol = $1
       ORDER BY date DESC
       LIMIT 1`,
      [sym]
    );
    if (!row) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const formatted: Asset = {
      symbol: row.symbol,
      name: row.name,
      price: Number(row.price),
      date: (row.date as Date).toISOString().split("T")[0],
      class: row.class,
    };

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Error fetching asset by symbol:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
