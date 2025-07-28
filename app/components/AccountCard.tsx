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

const AccountCard = () => {
    return (
        <>
            <Card className='p-2'>
                <CardHeader className='pb-1'>
                    <CardTitle className='font-semi-bold text-5xl mt-4'>Jhon Doe</CardTitle>
                </CardHeader>
                <CardContent className='flex gap-3 py-2'>
                    <div className='flex flex-col w-1/2'>
                        <p className='font-semi-bold text-4xl'>Value</p>
                        <CardDescription className='text-xl'>$1000</CardDescription>
                    </div>
                    <div className='flex flex-col w-1/2'>
                        <p className='font-semi-bold text-4xl'>Balance</p>
                        <CardDescription className='text-xl'>$200</CardDescription>
                    </div>
                </CardContent>
                
            </Card>
        </>
    )
}

export default AccountCard