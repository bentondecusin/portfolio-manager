import { NextResponse } from 'next/server'
import db from '../../db_test' // Adjust path as needed

interface Asset {
  symbol: string
  name: string
  price: number
  date: string
  class: string
}

export async function GET (request: Request) {
  try {
    const url = new URL(request.url)
    const symbolParam = url.searchParams.get('symbol')

    let sql = `
      SELECT a.symbol, a.name, a.price, a.date, a.class
      FROM assets a
      JOIN (
        SELECT symbol, MAX(date) AS max_date
        FROM assets
        GROUP BY symbol
      ) latest
      ON a.symbol = latest.symbol AND a.date = latest.max_date
    `
    const params: Array<string> = []

    if (symbolParam) {
      sql += ' WHERE a.symbol = ?'
      params.push(symbolParam.toUpperCase())
    }

    const [rows] = await db.query(sql, params)
    const formatted: Asset[] = (rows as any[]).map(row => ({
      symbol: row.symbol,
      name: row.name,
      price: Number(row.price),
      date: (row.date as Date).toISOString().split('T')[0],
      class: row.class
    }))
    return NextResponse.json(formatted)
  } catch (err) {
    console.error('Error fetching assets:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// POST /api/assets
export async function POST (request: Request) {
  try {
    const {
      symbol,
      name,
      price,
      date,
      class: assetClass
    } = await request.json()

    if (!symbol || !name || price == null || !date || !assetClass) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const [result] = await db.query(
      `INSERT INTO assets (symbol, name, price, date, class) VALUES (?, ?, ?, ?, ?)`,
      [symbol.toUpperCase(), name, price, date, assetClass]
    )

    return NextResponse.json(
      { message: 'Asset added', insertId: (result as any).insertId },
      { status: 201 }
    )
  } catch (err) {
    console.error('Error inserting asset:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
