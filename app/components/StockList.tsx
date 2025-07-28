import React from 'react'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button";

const stocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: '$150.00' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '$2800.00' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: '$3400.00' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', price: '$299.00' }
];

const StockList = () => {
    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Symbol</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {stocks.map((stock) => (
                        <TableRow key={stock.symbol}>
                            <TableCell className="font-medium">{stock.symbol}</TableCell>
                            <TableCell>{stock.name}</TableCell>
                            <TableCell>{stock.price}</TableCell>
                            <TableCell className="text-right">
                                <Button>Trade</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default StockList