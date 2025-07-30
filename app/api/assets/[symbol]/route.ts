import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { error } from "console";
import yahooFinance from "yahoo-finance2";

// GET /api/assets/:symbol
export async function GET(request: NextRequest, { params }) {
  try {
    params = await params;
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "daily"; // intraday | daily
    let range = searchParams.get("range") || "month"; // week | month
    const symbol = params["symbol"].toUpperCase();
    const now = new Date(2025, 6, 30);
    let today = now.toISOString();
    let fromDate = new Date();
    if (type === "intraday") {
      fromDate.setDate(now.getDate() - 1);
    } else if (range === "week") {
      fromDate.setDate(now.getDate() - 7);
    } else if (range === "month") {
      fromDate.setDate(now.getDate() - 30);
    }
    const from = fromDate.toISOString();
    let qry;
    let tableName;

    if (type === "intraday") {
      tableName = "asset_prices_intraday";
      let dateColumn = "price_datetime";
      qry = `
        SELECT
          ${dateColumn} as date,
          open_price as open,
          high_price as high,
          low_price as low,
          close_price as close,
          volume
        FROM ${tableName}
        WHERE symbol = '${symbol}'
        AND DATE(price_datetime) >= '${from}'
        AND DATE(price_datetime) <= '${today}'
        ORDER BY price_datetime ASC
      `;
    } else {
      tableName = "asset_prices_daily";
      let dateColumn = "price_date";
      qry = `
        SELECT
          ${dateColumn} as date,
          open_price as open,
          high_price as high,
          low_price as low,
          close_price as close,
          volume
        FROM ${tableName}
        WHERE symbol = '${symbol}'
        AND price_date >= '${from}'
        AND price_date <= '${today}'
        ORDER BY price_date ASC
      `;
    }

    const sql = process.env.DATABASE_URL && neon(process.env.DATABASE_URL);
    if (!sql) throw error("failed to connect to neon");
    const rows = await sql.query(qry);
    if (!rows) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const formatted = rows.map((row, idx) => ({
      date:
        type == "intraday"
          ? row.date
          : (row.date as Date).toISOString().split("T")[0],
      open: Number(row.open),
      high: Number(row.high),
      low: Number(row.low),
      close: Number(row.close),
      volume: Number(row.volume),
    }));

    return NextResponse.json({
      symbol: symbol,
      type: type,
      range: range,
      from: from,
      to: today,
      data: formatted,
    });
  } catch (err) {
    console.error("Error fetching asset by symbol:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
