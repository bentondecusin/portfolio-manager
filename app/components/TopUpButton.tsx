import React from 'react'
import { Button } from '@/components/ui/button'
import { CircleDollarSign } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import TopupForm from './TopUpForm';

interface TopUpProps {
    amount: string;
    setAmount: (value: string) => void;
}

const TopUp: React.FC<TopUpProps> = ({ amount, setAmount }) => {
    const [open, setOpen] = React.useState(false)

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger><CircleDollarSign size={28} /></DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Top Up Balance</DialogTitle>
                        <DialogDescription>
                            Add funds to your account using Stripe
                        </DialogDescription>
                    </DialogHeader>
                    <TopupForm amount={amount} setAmount={setAmount} onClose={handleClose} />
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default TopUp