
import { GoogleGenAI } from "@google/genai";

// Initialize the GoogleGenAI client instance.
// IMPORTANT: This requires the `API_KEY` environment variable to be set with a valid Google Generative AI API key
// in the environment where this application is built and/run.
// The application itself does NOT handle or request API key input from the user.
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define model names as constants for easy updates and consistency.
// TEXT_MODEL_NAME: Optimized for fast and coherent text generation, suitable for structured JSON.
export const TEXT_MODEL_NAME = "gemini-2.5-flash-preview-04-17";
// IMAGE_MODEL_NAME: A powerful model for generating high-quality images from text prompts.
export const IMAGE_MODEL_NAME = "imagen-3.0-generate-002";
