import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Create a function to initialize AI with custom config
export function createAI(apiKey?: string, model?: string) {
  const config: any = {
    plugins: [googleAI()],
    model: model || 'googleai/gemini-1.5-flash',
  };

  // If custom API key is provided, add it to the plugin config
  if (apiKey) {
    config.plugins = [googleAI({ apiKey })];
  }

  return genkit(config);
}

// Default AI instance (for backward compatibility)
export const ai = createAI();

// Function to get AI instance with user settings
export function getConfiguredAI(apiKey?: string, model?: string) {
  if (apiKey || model) {
    return createAI(apiKey, model);
  }
  return ai;
}
