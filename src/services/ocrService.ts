import { ComputerVisionClient } from '@azure/cognitiveservices-computervision';
import { ApiKeyCredentials } from '@azure/ms-rest-js';
import { azureConfig } from '../config/azure-config';

class OcrService {
    private client: ComputerVisionClient;
    private endpoint: string;
    private apiKey: string;

    constructor() {
        this.endpoint = azureConfig.endpoint;
        this.apiKey = azureConfig.key1;
        
        const credentials = new ApiKeyCredentials({ 
            inHeader: { 'Ocp-Apim-Subscription-Key': this.apiKey }
        });

        this.client = new ComputerVisionClient(
            credentials,
            this.endpoint
        );
    }

    async extractTextFromImage(imageUrl: string): Promise<string> {
        try {
            // Read the text from the image URL
            const result = await this.client.read(imageUrl);

            // Get operation ID from the response
            const operationId = result.operationLocation.split('/').pop() || '';

            // Wait for the operation to complete and get results
            let attempts = 0;
            const maxAttempts = 10;
            let operationResult = await this.client.getReadResult(operationId);

            while (operationResult.status !== "succeeded" && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                operationResult = await this.client.getReadResult(operationId);
                attempts++;
            }

            if (operationResult.status !== "succeeded") {
                throw new Error("OCR operation timed out");
            }

            // Extract and combine all detected text
            const text = operationResult.analyzeResult?.readResults
                .map(page => page.lines?.map(line => line.text).join('\n'))
                .join('\n');

            return text || 'No text detected';
        } catch (error) {
            console.error('Error in OCR operation:', error);
            throw new Error('Failed to extract text from image');
        }
    }

    async extractTextFromFile(file: File): Promise<string> {
        try {
            // Create FormData and append the file
            const formData = new FormData();
            formData.append('image', file);

            // Make direct API call to Azure Computer Vision
            const response = await fetch(`${this.endpoint}vision/v3.2/read/analyze`, {
                method: 'POST',
                headers: {
                    'Ocp-Apim-Subscription-Key': this.apiKey,
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Get the operation location from headers
            const operationLocation = response.headers.get('Operation-Location');
            
            if (!operationLocation) {
                throw new Error('Operation location not found in response');
            }

            // Poll for results
            let result;
            let attempts = 0;
            const maxAttempts = 10;

            while (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const resultResponse = await fetch(operationLocation, {
                    headers: {
                        'Ocp-Apim-Subscription-Key': this.apiKey
                    }
                });

                if (!resultResponse.ok) {
                    throw new Error(`HTTP error! status: ${resultResponse.status}`);
                }

                result = await resultResponse.json();

                if (result.status === 'succeeded') {
                    break;
                }

                attempts++;
            }

            if (!result || result.status !== 'succeeded') {
                throw new Error('OCR operation failed or timed out');
            }

            // Extract and combine all detected text
            const text = result.analyzeResult?.readResults
                .map((page: any) => page.lines?.map((line: any) => line.text).join('\n'))
                .join('\n');

            return text || 'No text detected';
        } catch (error) {
            console.error('Error in OCR operation:', error);
            throw new Error('Failed to extract text from image');
        }
    }

    private fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    }
}

export const ocrService = new OcrService(); 