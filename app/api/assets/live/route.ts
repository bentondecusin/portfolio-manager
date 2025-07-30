import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const sql = process.env.DATABASE_URL && neon(process.env.DATABASE_URL);
    if (!sql) throw Error("failed to connect to neon");
    const rows = await sql.query(
      `SELECT * FROM asset_quotes_live 
       ORDER BY last_updated DESC`
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "No live quotes found" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(rows);
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
