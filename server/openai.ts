import OpenAI from "openai";
import { STYLE_PROMPTS } from "@shared/types";

if (!process.env.OPENAI_API_KEY) {
  console.warn("Missing OPENAI_API_KEY environment variable");
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
    const stylePrompt = STYLE_PROMPTS[style];

    // STEP 1: Describe the image with GPT-4o
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

    const imageDescription = visionResponse.choices[0].message.content?.trim();
    if (!imageDescription) {
      throw new Error("Could not generate description from image.");
    }

    // STEP 2: Combine the image description with the style prompt
    const finalPrompt = `${stylePrompt}\n\nHere is the image content to transform:\n${imageDescription}\n\nPreserve the identity, pose, and scene layout while applying the style.`;

    // STEP 3: Generate the stylized image using DALL·E 3
    const generatedImage = await openai.images.generate({
      model: "dall-e-3",
      prompt: finalPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return generatedImage.data[0].url;
  } catch (error: any) {
    console.error("Error transforming image:", error.message);
    throw new Error(`Failed to transform image: ${error.message}`);
  }
}