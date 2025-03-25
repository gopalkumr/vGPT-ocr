
export interface AzureOpenAIRequest {
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

export interface AzureOpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Azure OpenAI API configuration
const AZURE_OPENAI_KEY = import.meta.env.VITE_AZURE_OPENAI_KEY;
const AZURE_OPENAI_ENDPOINT = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_DEPLOYMENT = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;
const AZURE_OPENAI_API_VERSION = "2024-02-15-preview";

export async function generateAzureResponse(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  temperature = 0.7,
  maxTokens = 1000
): Promise<string> {
  try {
    // Add system message to ensure proper markdown formatting if not already present
    let formattedMessages = [...messages];
    const hasSystemMessage = messages.some(msg => msg.role === 'system');
    
    if (!hasSystemMessage) {
      formattedMessages.unshift({
        role: 'system',
        content: 'You are a helpful assistant that provides clear, well-formatted responses. Use markdown formatting for code blocks, headings, and lists. For code, use triple backticks with the language specified.'
      });
    }
    
    const body: AzureOpenAIRequest = {
      messages: formattedMessages,
      temperature,
      max_tokens: maxTokens,
      top_p: 0.95,
    };

    const response = await fetch(
      `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${AZURE_OPENAI_API_VERSION}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_OPENAI_KEY,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Azure OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = (await response.json()) as AzureOpenAIResponse;
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating Azure response:', error);
    return 'I apologize, but I encountered an error while processing your request. Please try again later.';
  }
}
