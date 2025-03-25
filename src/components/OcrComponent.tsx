import { useState } from 'react';
import { ocrService } from '../services/ocrService';
import { gptService } from '../services/gptService';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Loader2, Copy, Check, X, Image } from "lucide-react";
import { GptResponseComponent } from './GptResponse';
import type { GptResponse } from '../services/gptService';
import { cn } from "@/lib/utils";

// Sample image URL with clear text for testing
const SAMPLE_IMAGE_URL = 'https://learn.microsoft.com/en-us/azure/cognitive-services/computer-vision/media/quickstarts/presentation.png';

interface OcrComponentProps {
    onMessageUpdate?: (message: string) => void;
}

export function OcrComponent({ onMessageUpdate }: OcrComponentProps) {
    const [imageUrl, setImageUrl] = useState('');
    const [extractedText, setExtractedText] = useState('');
    const [userQuery, setUserQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [gptResponse, setGptResponse] = useState<GptResponse | null>(null);
    const [copiedText, setCopiedText] = useState(false);
    const [showOcr, setShowOcr] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleUrlSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageUrl) return;

        setIsLoading(true);
        setError('');
        try {
            const text = await ocrService.extractTextFromImage(imageUrl);
            setExtractedText(text);
            if (onMessageUpdate) {
                onMessageUpdate(text);
            }
        } catch (err) {
            setError('Failed to extract text from the image URL');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file (JPEG, PNG, etc.)');
            return;
        }

        const MAX_FILE_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
            setError('File size too large. Please upload an image smaller than 10MB.');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const text = await ocrService.extractTextFromFile(file);
            setExtractedText(text);
            if (onMessageUpdate) {
                onMessageUpdate(text);
            }
            
            const previewUrl = URL.createObjectURL(file);
            setImageUrl(previewUrl);
            
            return () => URL.revokeObjectURL(previewUrl);
        } catch (err: any) {
            console.error('File upload error:', err);
            setError(`Failed to extract text: ${err.message || 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestImage = async () => {
        setImageUrl(SAMPLE_IMAGE_URL);
        setIsLoading(true);
        setError('');
        try {
            const text = await ocrService.extractTextFromImage(SAMPLE_IMAGE_URL);
            setExtractedText(text);
            if (onMessageUpdate) {
                onMessageUpdate(text);
            }
        } catch (err) {
            setError('Failed to extract text from the sample image');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyExtractedText = async () => {
        if (!extractedText) return;
        
        try {
            // Create a temporary textarea element
            const textarea = document.createElement('textarea');
            textarea.value = extractedText;
            document.body.appendChild(textarea);
            
            // Select and copy the text
            textarea.select();
            document.execCommand('copy');
            
            // Clean up
            document.body.removeChild(textarea);
            
            // Show feedback
            setCopiedText(true);
            setTimeout(() => setCopiedText(false), 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
            setError('Failed to copy text to clipboard');
        }
    };

    const handleMoveText = () => {
        if (onMessageUpdate && extractedText) {
            onMessageUpdate(extractedText);
            setShowOcr(false); // Hide OCR interface after moving text
        }
    };

    return (
        <div className="w-full flex justify-center mb-4">
            {/* Chat with Image Button */}
            <Button
                variant="outline"
                size="lg"
                onClick={() => setShowOcr(!showOcr)}
                className={cn(
                    "relative group transition-all duration-300 ease-out",
                    "hover:bg-primary/10 hover:text-primary hover:border-primary",
                    "before:absolute before:inset-0",
                    "before:rounded-lg before:border before:border-primary/50",
                    "before:transition-all",
                    isHovered ? "before:scale-105 before:opacity-100 animate-glow" : "before:scale-100 before:opacity-0",
                    "active:scale-95"
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Image className={cn(
                    "w-5 h-5 mr-2 transition-transform duration-300",
                    isHovered ? "scale-110" : "scale-100"
                )} />
                Chat with Image
            </Button>

            {/* OCR Interface */}
            {showOcr && (
                <Card className="fixed inset-4 md:inset-auto md:absolute md:top-[120%] md:left-1/2 md:-translate-x-1/2 md:w-[600px] p-6 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto max-h-[80vh]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Extract Text from Image</h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowOcr(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {/* File Upload Section */}
                        <div className="space-y-2">
                            <Label htmlFor="file-upload">Upload Image</Label>
                            <Input
                                id="file-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                disabled={isLoading}
                            />
                        </div>

                        {/* URL Input Section */}
                        <div className="space-y-2">
                            <form onSubmit={handleUrlSubmit} className="space-y-2">
                                <Label htmlFor="image-url">Or Enter Image URL</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="image-url"
                                        type="url"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                        disabled={isLoading}
                                    />
                                    <Button type="submit" disabled={isLoading || !imageUrl}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing
                                            </>
                                        ) : (
                                            'Extract Text'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="text-red-500 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Results Section */}
                        {extractedText && (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="extracted-text">Extracted Text</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleCopyExtractedText}
                                            className="flex items-center gap-2"
                                        >
                                            {copiedText ? (
                                                <>
                                                    <Check className="h-4 w-4" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-4 w-4" />
                                                    Copy
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleMoveText}
                                            className="flex items-center gap-2"
                                        >
                                            Move to Message
                                        </Button>
                                    </div>
                                </div>
                                <Textarea
                                    id="extracted-text"
                                    value={extractedText}
                                    readOnly
                                    className="min-h-[200px]"
                                    placeholder="Extracted text will appear here..."
                                />
                            </div>
                        )}

                        {/* Preview Image */}
                        {imageUrl && (
                            <div className="space-y-2">
                                <Label>Preview Image</Label>
                                <div className="rounded-lg overflow-hidden border">
                                    <img 
                                        src={imageUrl} 
                                        alt="Preview" 
                                        className="max-w-full h-auto"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
} 