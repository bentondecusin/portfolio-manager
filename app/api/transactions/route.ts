import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const sql = process.env.DATABASE_URL && neon(process.env.DATABASE_URL);
  if (!sql) throw Error("failed to connect to neon");
  const rows = await sql.query("SELECT * FROM transactions");
  if (!rows) {
    return NextResponse.json(
      { error: "Failed to fetch historic transactions" },
      { status: 500 }
    );
  }
  return NextResponse.json(rows);
}
