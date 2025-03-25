import { azureConfig } from '../config/azure-config';

export interface GptResponse {
    text: string;
    codeBlocks: Array<{
        language: string;
        code: string;
    }>;
    hasCodeBlocks: boolean;
}

class GptService {
    private endpoint: string;
    private apiKey: string;

    constructor() {
        this.endpoint = azureConfig.endpoint;
        this.apiKey = azureConfig.key1;
    }

    async getGptResponse(extractedText: string, userQuery: string): Promise<GptResponse> {
        try {
            const prompt = `
                Context from Image:
                ${extractedText}

                User Query:
                ${userQuery}

                Please provide a detailed response. If you include code examples, please format them using markdown code blocks with the appropriate language specification.
            `;

            const response = await fetch(`${this.endpoint}openai/deployments/your-deployment-name/chat/completions?api-version=2024-02-15-preview`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': this.apiKey
                },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: "You are a helpful assistant that provides detailed responses based on image text and user queries. When providing code examples, always use proper markdown formatting." },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 800
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const responseText = data.choices[0].message.content;

            // Extract code blocks from the response
            const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
            const codeBlocks = [];
            let match;

            while ((match = codeBlockRegex.exec(responseText)) !== null) {
                codeBlocks.push({
                    language: match[1] || 'text',
                    code: match[2].trim()
                });
            }

            return {
                text: responseText,
                codeBlocks,
                hasCodeBlocks: codeBlocks.length > 0
            };
        } catch (error) {
            console.error('Error in GPT operation:', error);
            throw new Error('Failed to get GPT response');
        }
    }
}

export const gptService = new GptService(); 