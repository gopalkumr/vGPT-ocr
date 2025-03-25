
import { supabase } from '@/integrations/supabase/client';
import { uploadFile } from './supabase';
import { ComputerVisionClient } from '@azure/cognitiveservices-computervision';
import { CognitiveServicesCredentials } from '@azure/ms-rest-azure-js';

// Azure Computer Vision configuration
const AZURE_CV_KEY = '3Y7tzdEkYP9at3pSvRZQxkERDLrupI26qf6b3jiON3KlOMgVHLwJJQQJ99BCACYeBjFXJ3w3AAAFACOGv1YD';
const AZURE_CV_ENDPOINT = 'https://azure-ai-project-gopal.cognitiveservices.azure.com/';

// Create Azure Computer Vision client
const computerVisionClient = new ComputerVisionClient(
  new CognitiveServicesCredentials(AZURE_CV_KEY),
  AZURE_CV_ENDPOINT
);

// Function to extract text from images using Azure Computer Vision
async function extractTextFromImage(imageUrl: string): Promise<string> {
  try {
    console.log('Extracting text from image:', imageUrl);
    
    // Use Azure's Read API (OCR) to extract text from the image
    const result = await computerVisionClient.read(imageUrl);
    
    // Get operation ID from the response
    const operationId = result.operationLocation.split('/').pop();
    
    if (!operationId) {
      throw new Error('Failed to get operation ID');
    }
    
    console.log('Operation ID:', operationId);
    
    // Wait for the operation to complete
    let status = 'notStarted';
    let textResults;
    let retries = 0;
    const maxRetries = 10;
    
    while (status !== 'succeeded' && retries < maxRetries) {
      textResults = await computerVisionClient.getReadResult(operationId);
      status = textResults.status;
      console.log('Operation status:', status);
      
      if (status === 'failed') {
        throw new Error('Azure OCR operation failed');
      }
      
      retries++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (status !== 'succeeded') {
      throw new Error('Azure OCR operation timed out');
    }
    
    // Extract and combine the text
    let extractedText = '';
    if (textResults && textResults.analyzeResult && textResults.analyzeResult.readResults) {
      for (const page of textResults.analyzeResult.readResults) {
        for (const line of page.lines) {
          extractedText += line.text + ' ';
        }
        extractedText += '\n';
      }
    }
    
    console.log('Extracted text length:', extractedText.length);
    
    return extractedText.trim() || 'No text detected in the image.';
  } catch (error) {
    console.error('Error in Azure OCR:', error);
    if (error instanceof Error) {
      return `Error extracting text: ${error.message}`;
    }
    return 'Unknown error occurred during text extraction';
  }
}

// Function to check if file is supported
function isFileSupported(file: File): boolean {
  const supportedTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/bmp',
    'image/heic'
  ];
  
  // Check if extension matches even if MIME type doesn't
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  const supportedExtensions = ['png', 'jpeg', 'jpg', 'bmp', 'heic', 'pdf', 'tiff', 'tif'];
  
  return supportedTypes.includes(file.type) || 
         (fileExtension !== undefined && supportedExtensions.includes(fileExtension));
}

export async function processFile(
  file: File, 
  userId: string, 
  chatId: string
): Promise<{ text: string; fileId: string | null }> {
  try {
    console.log('Processing file:', file.name, file.type, file.size);
    
    // Check if file is supported
    if (!isFileSupported(file)) {
      return {
        text: `The file type is not supported. Supported formats: PNG, JPG, JPEG, BMP, HEIC. Current file type: ${file.type}`,
        fileId: null
      };
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return {
        text: 'File size exceeds 5MB limit.',
        fileId: null
      };
    }
    
    // Upload file to Supabase storage
    const fileUpload = await uploadFile(file, userId, chatId);
    
    if (!fileUpload) {
      throw new Error('Failed to upload file');
    }
    
    let extractedText = '';
    
    // Get file URL for Azure processing
    const { data: publicURL } = supabase.storage
      .from('files')
      .getPublicUrl(fileUpload.path);
    
    if (!publicURL || !publicURL.publicUrl) {
      throw new Error('Failed to get public URL for uploaded file');
    }
    
    console.log('File uploaded, public URL:', publicURL.publicUrl);
    
    // Extract text from image
    extractedText = await extractTextFromImage(publicURL.publicUrl);
    
    // If extraction failed, return error
    if (extractedText.startsWith('Error extracting text')) {
      return {
        text: 'The document could not be parsed. This may be due to unsupported file format, file corruption, or password protection. Please try with a different file.',
        fileId: fileUpload.id
      };
    }
    
    // Update file record with extracted text
    const { error } = await supabase
      .from('file_uploads')
      .update({ extracted_text: extractedText })
      .eq('id', fileUpload.id);
      
    if (error) {
      console.error('Error updating file with extracted text:', error);
    }
    
    return {
      text: extractedText,
      fileId: fileUpload.id
    };
  } catch (error) {
    console.error('Error processing file:', error);
    
    // Return a more descriptive error message
    let errorMessage = 'Failed to process the file. Please try again.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      text: errorMessage,
      fileId: null
    };
  }
}

export function getFileTypeFromExtension(filename: string): 'image' | 'video' | 'other' {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  if (['jpg', 'jpeg', 'png', 'bmp', 'heic', 'pdf', 'tiff', 'tif'].includes(ext)) {
    return 'image';
  } else if (ext === 'mp4') {
    return 'video';
  } else {
    return 'other';
  }
}
