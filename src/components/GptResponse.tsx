import { useState } from 'react';
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Check, Copy } from "lucide-react";
import type { GptResponse } from '../services/gptService';
import ReactMarkdown from 'react-markdown';

interface CodeProps {
    inline?: boolean;
    className?: string;
    children: React.ReactNode;
}

interface GptResponseProps {
    response: GptResponse | null;
}

export function GptResponseComponent({ response }: GptResponseProps) {
    const [copiedText, setCopiedText] = useState<string | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    if (!response) return null;

    const handleCopyText = async () => {
        try {
            await navigator.clipboard.writeText(response.text);
            setCopiedText('full');
            setTimeout(() => setCopiedText(null), 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    };

    const handleCopyCode = async (code: string, index: number) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(`${index}`);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    return (
        <Card className="p-6 space-y-4">
            <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold">GPT Response</h2>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyText}
                    className="flex items-center gap-2"
                >
                    {copiedText === 'full' ? (
                        <>
                            <Check className="h-4 w-4" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Copy className="h-4 w-4" />
                            Copy Full Response
                        </>
                    )}
                </Button>
            </div>

            <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                    components={{
                        code({ inline, className, children, ...props }: CodeProps) {
                            const match = /language-(\w+)/.exec(className || '');
                            const codeIndex = response.codeBlocks.findIndex(
                                block => block.code === String(children).trim()
                            );

                            if (!inline && match && codeIndex !== -1) {
                                return (
                                    <div className="relative group">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCopyCode(String(children), codeIndex)}
                                            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            {copiedCode === `${codeIndex}` ? (
                                                <>
                                                    <Check className="h-4 w-4 mr-1" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-4 w-4 mr-1" />
                                                    Copy Code
                                                </>
                                            )}
                                        </Button>
                                        <pre className="p-4 bg-muted rounded-lg">
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        </pre>
                                    </div>
                                );
                            }
                            return <code className={className} {...props}>{children}</code>;
                        },
                    }}
                >
                    {response.text}
                </ReactMarkdown>
            </div>
        </Card>
    );
} 