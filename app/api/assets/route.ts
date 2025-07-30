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
    const grouped = rows.reduce((acc, row) => {
      const key = row.symbol;
      if (!acc[key]) {
        acc[key] = {
          symbol: row.symbol,
          name: row.name,
          class: row.class,
          history: [],
        };
      }

      acc[key].history.push({
        date: row.date.toISOString().split("T")[0], // or row.date if already a string
        price: parseFloat(row.price),
      });

      return acc;
    }, {});
    return NextResponse.json(Object.values(grouped));
  } catch (err) {
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
