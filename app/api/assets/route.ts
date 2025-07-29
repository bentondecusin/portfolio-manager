import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { error } from "console";
interface Asset {
  symbol: string;
  name: string;
  price: number;
  date: string;
  class: string;
}

export async function GET(request: Request) {
  try {
    const sql = process.env.DATABASE_URL && neon(process.env.DATABASE_URL);
    if (!sql) throw error("failed to connect to neon");

    let query = `
      SELECT *
      FROM assets a
    `;

    const rows = await sql.query(query);
    console.log(rows);
    const formatted: Asset[] = (rows as any[]).map((row) => ({
      symbol: row.symbol,
      name: row.name,
      price: Number(row.price),
      date: (row.date as Date).toISOString().split("T")[0],
      class: row.class,
    }));
    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Error fetching assets:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// POST /api/assets
export async function POST(request: Request) {
  try {
    const {
      symbol,
      name,
      price,
      date,
      class: assetClass,
    } = await request.json();

    if (!symbol || !name || price == null || !date || !assetClass) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      `INSERT INTO assets (symbol, name, price, date, class) VALUES (?, ?, ?, ?, ?)`,
      [symbol.toUpperCase(), name, price, date, assetClass]
    );

    return NextResponse.json(
      { message: "Asset added", insertId: (result as any).insertId },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error inserting asset:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
