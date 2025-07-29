import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, X } from 'lucide-react'
import { GoogleGenAI, Type } from '@google/genai'
import { param } from 'framer-motion/client'

const ai = new GoogleGenAI({});

// Define the function declaration for the model
const getStockQuote = {
    name: 'getStockQuote', // TODO: update this to match api call
    description: 'Get stock quote for a given symbol',
    paramaters: {
        type: Type.OBJECT,
        properties: {
            symbol: {
                type: Type.STRING,
                description: 'The stock symbol to get the quote for',
            }
        }
    }
}

// Define the Role enum
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

    const generateAIResponse = (userMessage: string): string => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userMessage,
            config: {
                tools: [{
                    functionDeclarations: [getStockQuote]
                }],
            },
        })
        if (response.functionCalls && response.functionCalls.length > 0) {
            const functionCall = response.functionCalls[0];
            console.log(`Function to call: ${functionCall.name}`);
            console.log(`Arguments: ${JSON.stringify(functionCall.args)}`);

            if (functionCall.name === 'getStockQuote') {
                const { symbol } = functionCall.args;
                getStockQuote(symbol)
            }
        } else {
            console.log("No function call found in the response.");
            console.log(response.text);
        }
    }

    const handleSendMessage = async () => {
        if (inputValue.trim()) {
            // Add user message
            const userMessage: Message = {
                text: inputValue,
                role: Role.USER,
                timestamp: Date.now()
            }

            setMessages(prev => [...prev, userMessage])
            setLoading(true)
            setInputValue('')

            // Simulate AI response delay
            setTimeout(() => {
                const aiResponse: Message = {
                    text: generateAIResponse(inputValue),
                    role: Role.AI,
                    timestamp: Date.now()
                }

                setMessages(prev => [...prev, aiResponse])
                setLoading(false)
            }, 1000) // 1 second delay to simulate thinking
        }
    }

    return (
        <div>
            <section className="fixed bottom-5 right-5 z-40 flex flex-col justify-end items-end gap-2">
                {isChatBotOpen &&
                    <div className="rounded-md w-[20rem] md:w-[25rem] lg:w-[30rem] h-[70vh] bg-slate-100 shadow-lg border">
                        <div className="flex justify-between items-center border-b-2 px-6 h-[12%]">
                            <p className='font-semibold text-lg'>Let's Chat!</p>
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
                                    <p className="text-sm">{message.text}</p>
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
                        <span className='text-xl'>Let's Chat!</span>
                    </Button>
                </div>
            </section>
        </div>
    )
}

export default ChatBot