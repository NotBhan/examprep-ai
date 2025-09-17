
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Bot, User, Lightbulb } from 'lucide-react';
import { useAppContext } from '@/hooks/use-app';
import { askTutorAction } from '../actions';
import { ScrollArea } from '@/components/ui/scroll-area';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

const examplePrompts = [
    'Explain the most important topic.',
    'Summarize the first main topic for me.',
    'Compare and contrast the first two main topics.',
    'What is the estimated weightage of each main topic?',
];

export default function TutorPage() {
    const { syllabusText, showErrorDialog } = useAppContext();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (input.trim() === '' || !syllabusText) {
            showErrorDialog(
                'Error',
                !syllabusText ? 'No active syllabus found. Please upload or select a syllabus first.' : 'Please enter a question.'
            );
            return;
        }

        const newMessages: Message[] = [...messages, { role: 'user', content: input }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const result = await askTutorAction({ question: input, syllabusContent: syllabusText });
            if (result.success && result.data) {
                setMessages([...newMessages, { role: 'assistant', content: result.data.answer }]);
            } else {
                throw new Error(result.error || 'Failed to get an answer.');
            }
        } catch (error: any) {
            setMessages(newMessages); // Revert to messages before AI call
            showErrorDialog(
                'Tutor Error',
                error.message
            );
        } finally {
            setIsLoading(false);
        }
    };
    
    const handlePromptClick = (prompt: string) => {
        setInput(prompt);
        inputRef.current?.focus();
    }

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="mb-4">
                <h2 className="text-3xl font-bold tracking-tight font-headline">
                    AI Tutor: Marika
                </h2>
                <p className="text-muted-foreground">
                    Ask questions about your syllabus and get instant, context-aware answers.
                </p>
            </div>
            
            <Card className="flex-1 flex flex-col">
                <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="h-6 w-6 text-primary"/>
                        Conversation
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 flex flex-col">
                    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                        <div className="space-y-6 pr-4">
                        {messages.length === 0 && !isLoading ? (
                            <div className="text-center text-muted-foreground pt-10">
                                <Lightbulb className="mx-auto h-10 w-10 mb-4 text-primary" />
                                <p className="font-semibold">Welcome to your AI Tutor!</p>
                                <p className="mb-6">Click a prompt or type your own question below to get started.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                                    {examplePrompts.map((prompt, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => handlePromptClick(prompt)}
                                            className="p-3 border rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                             messages.map((message, index) => (
                                <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                                    {message.role === 'assistant' && (
                                        <div className="bg-primary rounded-full p-2">
                                            <Bot className="h-6 w-6 text-primary-foreground" />
                                        </div>
                                    )}
                                    <div className={`rounded-lg p-3 max-w-lg ${message.role === 'user' ? 'bg-accent' : 'bg-card border'}`}>
                                        <p className="text-sm">{message.content}</p>
                                    </div>
                                    {message.role === 'user' && (
                                        <div className="bg-muted rounded-full p-2">
                                             <User className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                         {isLoading && (
                            <div className="flex items-start gap-4">
                                <div className="bg-primary rounded-full p-2">
                                    <Bot className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <div className="rounded-lg p-3 bg-card border">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                </div>
                            </div>
                         )}
                        </div>
                    </ScrollArea>
                    <div className="p-4 border-t">
                        <div className="relative">
                            <Textarea
                                ref={inputRef}
                                placeholder="Ask Marika a question about your syllabus..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                className="pr-20 min-h-[50px] resize-none"
                                disabled={isLoading}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="absolute top-1/2 right-3 -translate-y-1/2"
                                onClick={handleSendMessage}
                                disabled={isLoading || !input.trim()}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
