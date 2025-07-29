import { NextResponse } from 'next/server'
import db from '../../../db_test'

interface Asset {
  symbol: string
  name: string
  price: number
  date: string
  class: string
}

// GET /api/assets/:symbol
export async function GET (
  request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const sym = params.symbol.toUpperCase()
    const [rows] = await db.query(
      `SELECT symbol, name, price, date, class
       FROM assets
       WHERE symbol = ?
       ORDER BY date DESC
       LIMIT 1`,
      [sym]
    )

    if ((rows as any[]).length === 0) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    const row = (rows as any[])[0]
    const formatted: Asset = {
      symbol: row.symbol,
      name: row.name,
      price: Number(row.price),
      date: (row.date as Date).toISOString().split('T')[0],
      class: row.class
    }

    return NextResponse.json(formatted)
  } catch (err) {
    console.error('Error fetching asset by symbol:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// DELETE /api/assets/:symbol
export async function DELETE (
  request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const sym = params.symbol.toUpperCase()
    const [result] = await db.query(`DELETE FROM assets WHERE symbol = ?`, [
      sym
    ])

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    return NextResponse.json({ message: `Deleted asset(s) with symbol ${sym}` })
  } catch (err) {
    console.error('Error deleting asset:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
