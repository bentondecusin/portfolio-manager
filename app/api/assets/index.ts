import type { NextApiRequest, NextApiResponse } from 'next'
import db from '../../db' // Adjust path as needed

interface Asset {
  symbol: string
  name: string
  price: number
  date: string
  class: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const symbol = (req.query.symbol as string) || undefined

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
      const params: any[] = []

      if (symbol) {
        sql += ' WHERE a.symbol = ?'
        params.push(symbol.toUpperCase())
      }

      const [rows] = await db.query(sql, params)
      const formatted = (rows as any[]).map(row => ({
        ...row,
        date: (row.date as Date).toISOString().split('T')[0],
      }))
      res.status(200).json(formatted)
    } catch (err) {
      console.error('Error fetching assets:', err)
      res.status(500).json({ error: 'Database error' })
    }
  }

  else if (req.method === 'POST') {
    try {
      const { symbol, name, price, date, class: assetClass } = req.body as Asset

      if (!symbol || !name || !price || !date || !assetClass) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      const [result] = await db.query(
        `INSERT INTO assets (symbol, name, price, date, class) VALUES (?, ?, ?, ?, ?)`,
        [symbol.toUpperCase(), name, price, date, assetClass]
      )

      const insertId = (result as any).insertId
      res.status(201).json({ message: 'Asset added', insertId })
    } catch (err) {
      console.error('Error inserting asset:', err)
      res.status(500).json({ error: 'Database error' })
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
