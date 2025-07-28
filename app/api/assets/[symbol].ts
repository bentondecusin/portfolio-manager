import type { NextApiRequest, NextApiResponse } from 'next'
import db from '../../db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const symbol = (req.query.symbol as string)?.toUpperCase()

  if (!symbol) return res.status(400).json({ error: 'Symbol is required' })

  if (req.method === 'GET') {
    try {
      const [rows] = await db.query(
        `SELECT symbol, name, price, date, class FROM assets WHERE symbol = ? ORDER BY date DESC LIMIT 1`,
        [symbol]
      )

      const casted = rows as any[]
      if (casted.length === 0) {
        return res.status(404).json({ error: 'Asset not found' })
      }

      const formatted = casted.map(row => ({
        ...row,
        date: (row.date as Date).toISOString().split('T')[0],
      }))
      res.status(200).json(formatted)
    } catch (err) {
      console.error('Error fetching asset by symbol:', err)
      res.status(500).json({ error: 'Database error' })
    }
  }

  else if (req.method === 'DELETE') {
    try {
      const [result] = await db.query(`DELETE FROM assets WHERE symbol = ?`, [symbol])
      if ((result as any).affectedRows === 0) {
        return res.status(404).json({ error: 'Asset not found' })
      }

      res.status(200).json({ message: `Deleted asset(s) with symbol ${symbol}` })
    } catch (err) {
      console.error('Error deleting asset:', err)
      res.status(500).json({ error: 'Database error' })
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
