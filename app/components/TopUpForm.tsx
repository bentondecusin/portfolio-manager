import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'

interface TopupFormProps {
    onClose: () => void;
    setIsTopUpDone?: (value: boolean) => void;
}

const TopupForm: React.FC<TopupFormProps> = ({ onClose, setIsTopUpDone }) => {
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [success, setSuccess] = React.useState(false)
    const [inputValue, setInputValue] = React.useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value)
        setError(null)
    }

    const handleSubmit = async () => {
        if (!inputValue || Number(inputValue) <= 0) {
            setError('Please enter a valid amount')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await fetch('http://localhost:8080/balance', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount: Number(inputValue) }),
            });

            if (!response.ok) {
                throw new Error('Failed to update balance');
            }

            console.log("Top up response:", response);
            
            // Mark topup as done to trigger balance refresh
            if (setIsTopUpDone) {
                setIsTopUpDone(true);
            }
            
            // Close dialog after successful submission
            setTimeout(() => {
                onClose()
                setSuccess(false)
                setInputValue('')
            }, 1000)
            
        } catch (error) {
            setError('Failed to update balance')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="pt-2 space-y-5">
            <div>
                <p className="pb-2">Enter Amount</p>
                <Input
                    onChange={handleChange}
                    value={inputValue}
                    className='py-7 text-md'
                    placeholder='$9999'
                    type="number"
                    min="1"
                />
            </div>
            
            <div>
                <p className="pb-2">Payment method</p>
                <div className="flex items-center space-x-2 border p-3 rounded-md bg-muted/20">
                    <Label className="flex items-center space-x-2">
                        <img
                            className='h-6'
                            src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg"
                            alt="stripe logo" 
                        />
                        {/* <span>Stripe</span> */}
                    </Label>
                </div>
            </div>

            {error && (
                <div className="text-red-500 text-sm">{error}</div>
            )}

            {success && (
                <div className="text-green-500 text-sm">Payment successful!</div>
            )}
            
            <Button
                onClick={handleSubmit}
                className='w-full py-7'
                disabled={loading}
            >
                {loading ? 'Processing...' : 'Submit'}
            </Button>
        </div>
    )
}

export default TopupForm