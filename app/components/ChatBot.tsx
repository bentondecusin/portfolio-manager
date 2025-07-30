import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, X } from 'lucide-react'

enum Role {
    USER = 'user',
    AI = 'ai'
}

interface Message {
    text: string
    role: Role
    timestamp: number
}

const ChatBot = () => {
    const [inputValue, setInputValue] = React.useState("")
    const [isChatBotOpen, setIsChatBotOpen] = React.useState(false)
    const [messages, setMessages] = React.useState<Message[]>([
        {
            text: "Hello! I'm your financial assistant. How can I assist you today?",
            role: Role.AI,
            timestamp: Date.now()
        }
    ])
    const [loading, setLoading] = React.useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value)
    }

    const handleChatBotOpen = () => {
        setIsChatBotOpen(!isChatBotOpen)
    }

    const handleSendMessage = async () => {
        if (inputValue.trim()) {
            const userMessage: Message = {
                text: inputValue,
                role: Role.USER,
                timestamp: Date.now()
            }

            setMessages(prev => [...prev, userMessage])
            setLoading(true)
            setInputValue('')

            // turn down case all the word and find key word "yesterday"
            const lowerMessage = userMessage.text.toLowerCase();
            const hasYesterday = lowerMessage.includes('yesterday');
            const symbolMatch = userMessage.text.match(/\b[A-Z]{2,5}\b/g);
            const detectedSymbol = symbolMatch ? symbolMatch[0] : null;

            let aiResponseText = '';

            if (hasYesterday) {
                if (detectedSymbol) {
                    try {
                        console.log('Fetching specific asset history for:', detectedSymbol);
                        const url = new URL(`http://localhost:8080/assets/${detectedSymbol}/history`);
                        url.searchParams.set('type', 'daily');
                        url.searchParams.set('range', 'week');

                        console.log('Request URL:', url.toString());
                        const resp = await fetch(url.toString())    
                        console.log('Response status:', resp.status);
                        console.log('Response ok:', resp.ok);
                        
                        if (!resp.ok) {
                            const errorText = await resp.text();
                            console.error('HTTP Error:', resp.status, errorText);
                            throw new Error(`HTTP ${resp.status}: ${errorText}`);
                        }
                        
                        const payload = await resp.json()
                        console.log('Response payload:', payload);
                        const list = payload.data || []

                        if (list.length < 2) {
                            aiResponseText = `Do not have enough data to get ${detectedSymbol} data.`
                        } else {
                            const yesterdayData = list[list.length - 2]
                            aiResponseText = `Here's ${detectedSymbol}'s data for ${yesterdayData.date}:\n\n` +
                                `Open: $${yesterdayData.open}\n` +
                                `High: $${yesterdayData.high}\n` +
                                `Low: $${yesterdayData.low}\n` +
                                `Close: $${yesterdayData.close}\n` +
                                `Volume: ${yesterdayData.volume.toLocaleString()}`;
                        } 
                    } catch (error) {
                        console.error('Error fetching asset data:', error);
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                        aiResponseText = `Sorry, there was an error fetching ${detectedSymbol}'s data. Error: ${errorMessage}`;
                    }
                } 
            } else {
                aiResponseText = `I'm here to help with your financial queries! You can ask me about stock prices by mentioning "yesterday" and a stock symbol, like "What was AAPL's price yesterday?"`;
            }

            // Simulate AI response delay
            setTimeout(() => {
                const aiResponse: Message = {
                    text: aiResponseText,
                    role: Role.AI,
                    timestamp: Date.now()
                }

                setMessages(prev => [...prev, aiResponse])
                setLoading(false)
            }, 1000)
        }
    }

    return (
        <div>
            <section className="fixed bottom-5 right-5 z-40 flex flex-col justify-end items-end gap-2">
                {isChatBotOpen &&
                    <div className="rounded-md w-[20rem] md:w-[25rem] lg:w-[30rem] h-[70vh] bg-slate-100 shadow-lg border">
                        <div className="flex justify-between items-center border-b-2 px-6 h-[12%]">
                            <p className='font-semibold text-lg'>Let us Chat!</p>
                            <Button
                                variant={'ghost'}
                                size={'icon'}
                                className='bg-slate-100 hover:bg-slate-200'
                                onClick={handleChatBotOpen}
                            >
                                <X style={{ width: '20px', height: '20px' }} />
                            </Button>
                        </div>
                        <div className="h-[76%] flex flex-col overflow-y-auto gap-5 px-5 py-2 scroll-container">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`${message.role === Role.AI ? "self-start bg-sky-200" : "self-end bg-violet-200"} pb-5 px-5 py-2 rounded-md w-auto text-left max-w-[80%]`}
                                >
                                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                                </div>
                            ))}
                            {loading && (
                                <div className="self-start pb-5 w-auto">
                                    <div className="px-5 py-2 rounded-md bg-blue-200 w-auto text-left">
                                        <p className="text-sm">Thinking...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className='h-[12%] border-t flex'>
                            <Input
                                className='flex-1 h-full border-none outline-none rounded-none focus-visible:ring-0'
                                placeholder='Type your message here...'
                                onChange={handleChange}
                                value={inputValue}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSendMessage()
                                    }
                                }}
                            />
                            <Button
                                onClick={handleSendMessage}
                                className="h-full rounded-none"
                                disabled={!inputValue.trim() || loading}
                            >
                                Send
                            </Button>
                        </div>
                    </div>
                }
                <div className="relative w-[10rem] cursor-pointer group">
                    <Button
                        className='w-full h-[3rem] gap-2 items-center'
                        onClick={handleChatBotOpen}
                    >
                        <MessageCircle className='fill-[#FFFFFF] -rotate-90' style={{ width: '24px', height: '24px' }} />
                        <span className='text-xl'>Let us Chat!</span>
                    </Button>
                </div>
            </section>
        </div>
    )
}

export default ChatBot
