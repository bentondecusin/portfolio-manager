import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { error } from "console";

interface Asset {
  symbol: string;
  name: string;
  price: number;
  date: string;
  class: string;
}

// GET /api/assets/:symbol
export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    params = await params;
    const { type, range } = request.nextUrl.searchParams;
    // if (days === 7) {
    //   params.append("type", "daily");
    //   params.append("range", "week");
    // } else if (days === 30) {
    //   params.append("type", "daily");
    //   params.append("range", "month");
    // } else {
    //   params.append("type", "intraday");
    // }

    const sym = params!.symbol!.toUpperCase();
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

// DELETE /api/assets/:symbol
export async function DELETE(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const sym = params.symbol.toUpperCase();
    const [result] = await db.query(`DELETE FROM assets WHERE symbol = ?`, [
      sym,
    ]);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: `Deleted asset(s) with symbol ${sym}`,
    });
  } catch (err) {
    console.error("Error deleting asset:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
