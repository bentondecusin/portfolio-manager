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
    setIsTopUpDone?: (value: boolean) => void;
}

const TopUp: React.FC<TopUpProps> = ({ setIsTopUpDone }) => {
    const [open, setOpen] = React.useState(false)

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger>
                    <CircleDollarSign size={28} color="#FFD700" />
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Top Up Balance</DialogTitle>
                        <DialogDescription>
                            Add funds to your account using Stripe
                        </DialogDescription>
                    </DialogHeader>
                    <TopupForm 
                        onClose={handleClose} 
                        setIsTopUpDone={setIsTopUpDone}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default TopUp