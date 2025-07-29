import React from 'react'
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import TopUp from './TopUpButton'

interface AccountCardProps {
    amount: string;
    setAmount: (value: string) => void;
}

const AccountCard: React.FC<AccountCardProps> = ({ amount, setAmount }) => {
    return (
        <>
            <Card className='p-2'>
                <CardHeader className='pb-1'>
                    <div className='flex items-end justify-start mt-4 space-x-2'>
                        <CardTitle className='font-semi-bold text-5xl'>Jhon Doe</CardTitle>
                        <TopUp amount={amount} setAmount={setAmount} />
                    </div>
                </CardHeader>
                <CardContent className='flex gap-3 py-2'>
                    <div className='flex flex-col w-1/2'>
                        <p className='font-semi-bold text-4xl'>Value</p>
                        <CardDescription className='text-xl'>$1000</CardDescription>
                    </div>
                    <div className='flex flex-col w-1/2'>
                        <p className='font-semi-bold text-4xl'>Balance</p>
                        <CardDescription className='text-xl'>${amount}</CardDescription>
                    </div>
                </CardContent>
                
            </Card>
        </>
    )
}

export default AccountCard