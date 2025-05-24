import OpenAI from "openai";
import { STYLE_PROMPTS } from "@shared/types";

// Environment variable verification
console.log("Environment check in openai.ts:");
console.log("- OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);
console.log("- OPENAI_API_KEY length:", process.env.OPENAI_API_KEY?.length || 0);
console.log("- NODE_ENV:", process.env.NODE_ENV || "not set");
console.log("- VERCEL_ENV:", process.env.VERCEL_ENV || "not set");

if (!process.env.OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY environment variable is not set");
  process.exit(1);
}

console.log("OpenAI API Key is configured (first few chars):", process.env.OPENAI_API_KEY?.substring(0, 5) + "...");
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function transformImage(
  imageBase64: string, 
  style: 'lego' | 'anime' | 'ghibli' | 'futuristic' | 'vintage'
): Promise<string> {
  try {
    console.log("Starting image transformation with style:", style);
    const stylePrompt = STYLE_PROMPTS[style];

    // STEP 1: Describe the image with GPT-4o
    console.log("Calling GPT-4o for image description...");
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Describe this person and the overall scene in detail — include facial features, expression, clothing, posture, and background."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 300,
    });

    console.log("GPT-4o response received");
    const imageDescription = visionResponse.choices[0].message.content?.trim();
    if (!imageDescription) {
      throw new Error("Could not generate description from image.");
    }

    // STEP 2: Combine the image description with the style prompt
    const finalPrompt = `${stylePrompt}\n\nHere is the image content to transform:\n${imageDescription}\n\nPreserve the identity, pose, and scene layout while applying the style.`;

    // STEP 3: Generate the stylized image using DALL·E 3
    console.log("Calling DALL-E 3 for image generation...");
    const generatedImage = await openai.images.generate({
      model: "dall-e-3",
      prompt: finalPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    console.log("DALL-E 3 response received");
    const imageUrl = generatedImage.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error("Failed to generate image URL");
    }

    return imageUrl;
  } catch (error: any) {
    console.error("Detailed error in transformImage:", {
      message: error.message,
      status: error.status,
      type: error.type,
      code: error.code,
      stack: error.stack
    });
    throw new Error(`Failed to transform image: ${error.message}`);
  }
}
