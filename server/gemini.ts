/**
 * Google Gemini AI Integration for Image Transformation
 * 
 * This file handles the integration with Google's Gemini AI for image analysis
 * and OpenAI's DALL-E for image generation. It uses a two-step process:
 * 1. Gemini analyzes the uploaded image and generates a textual description
 * 2. DALL-E uses that description to create a new image in the requested style
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { STYLE_PROMPTS } from "@shared/types";
import OpenAI from "openai";

// Check if the Gemini API key is available in environment variables
if (!process.env.GEMINI_API_KEY) {
  console.warn("Missing GEMINI_API_KEY environment variable");
}

// Initialize the Gemini API with the API key from environment variables
// Log a masked version of the key for debugging purposes
console.log("Gemini API Key is configured (first few chars):", process.env.GEMINI_API_KEY?.substring(0, 5) + "...");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Initialize OpenAI for image generation (we'll still use DALL-E for the final generation)
// This creates the client using the API key from environment variables
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "",
});

/**
 * Transforms an image using Gemini for vision analysis and DALL-E for image generation
 * 
 * @param imageBase64 - The base64-encoded image data to transform
 * @param style - The target art style (lego, anime, ghibli, futuristic, or vintage)
 * @returns Promise resolving to the URL of the transformed image
 */
export async function transformImageWithGemini(
  imageBase64: string, 
  style: 'lego' | 'anime' | 'ghibli' | 'futuristic' | 'vintage'
): Promise<string> {
  try {
    // Get the appropriate style prompt from our predefined prompts
    const prompt = STYLE_PROMPTS[style];
    
    // Use the newer Gemini 1.5 Flash model which can process both text and images
    // The older gemini-pro-vision model was deprecated on July 12, 2024
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create image parts for the model in the format expected by Gemini
    const imageParts = [
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg",
        },
      },
    ];
    
    // Generate a detailed description of the image with Gemini
    // This combines our style prompt with the image data
    const result = await model.generateContent([
      prompt,
      ...imageParts,
    ]);
    
    // Extract the textual description from Gemini's response
    const description = result.response.text();
    console.log("Gemini generated description:", description.substring(0, 100) + "...");
    
    // Use the description to generate an image with DALL-E
    // This takes the Gemini description and style prompt to create a new image
    const generatedImage = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${description}\n\nUsing the style: ${prompt}`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    // Safely access the URL with null coalescing to handle potential undefined values
    const imageUrl = generatedImage.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error("Failed to generate image URL");
    }
    
    // Return the URL of the generated image
    return imageUrl;
  } catch (error: any) {
    // Log and rethrow any errors that occur during the transformation process
    console.error("Error transforming image with Gemini:", error.message);
    throw new Error(`Failed to transform image with Gemini: ${error.message}`);
  }
}