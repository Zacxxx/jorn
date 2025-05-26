
/**
 * Parses a JSON string, attempting to recover from common AI formatting issues.
 * AI models sometimes wrap JSON in markdown code fences (```json ... ```) or might return
 * slightly malformed structures. This function tries to handle these cases.
 * 
 * @template T The expected type of the parsed JSON object.
 * @param {string} jsonString The raw string received from the AI, expected to contain JSON.
 * @returns {T | null} The parsed JSON object, or null if parsing fails after all attempts.
 */
export const parseJsonFromString = <T,>(jsonString: string): T | null => {
  let cleanedString = jsonString.trim();

  // Attempt to remove markdown code fences (e.g., ```json ... ``` or ``` ... ```)
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = cleanedString.match(fenceRegex);
  if (match && match[2]) {
    cleanedString = match[2].trim(); // Use the content within the fences
  }

  // Attempt 1: Direct parse of the (potentially cleaned) string.
  try {
    return JSON.parse(cleanedString) as T;
  } catch (error) {
    console.warn("Initial JSON parsing failed. Raw string (first 500 chars):", jsonString.substring(0,500));
    
    // Attempt 2: If direct parse fails, try to extract content between the first '{' and last '}'.
    // This can help if there's extraneous text before or after a valid JSON object.
    const jsonStart = cleanedString.indexOf('{');
    const jsonEnd = cleanedString.lastIndexOf('}') + 1;
    if (jsonStart !== -1 && jsonEnd > jsonStart) { // Ensure jsonEnd is valid and after jsonStart
      const extractedJson = cleanedString.substring(jsonStart, jsonEnd);
      try {
        console.log("Attempting to parse extracted JSON object:", extractedJson.substring(0,500));
        return JSON.parse(extractedJson) as T;
      } catch (nestedError) {
        console.warn("Nested JSON object parsing attempt also failed:", nestedError);
      }
    }

    // Attempt 3: If object extraction fails, try to extract content between the first '[' and last ']'.
    // This handles cases where the AI might return a JSON array directly without an enclosing object.
    const arrayStart = cleanedString.indexOf('[');
    const arrayEnd = cleanedString.lastIndexOf(']') + 1;
    if (arrayStart !== -1 && arrayEnd > arrayStart) { // Ensure arrayEnd is valid and after arrayStart
        const extractedArrayJson = cleanedString.substring(arrayStart, arrayEnd);
        try {
            console.log("Attempting to parse extracted JSON array:", extractedArrayJson.substring(0,500));
            return JSON.parse(extractedArrayJson) as T;
        } catch (arrayParseError) {
            console.warn("Array JSON parsing attempt also failed:", arrayParseError);
        }
    }

    // If all attempts fail, log the error and return null.
    console.error("All JSON parsing attempts failed for string (first 1000 chars):", jsonString.substring(0,1000));
    return null;
  }
};
