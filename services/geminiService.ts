
// This service is disabled as the application is now in Local-Only mode.
// No API calls to Google Gemini will be made.

export const generateGeminiResponse = async (
  prompt: string,
  history: any[]
): Promise<string> => {
  throw new Error("Cloud mode is disabled.");
};
