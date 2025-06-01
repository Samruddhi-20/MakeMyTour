import { LanguageType } from "../../types/chat";

// Mock translation function: just returns the original text with a note for demonstration
export async function translateMessage(
  text: string,
  from: LanguageType,
  to: LanguageType
): Promise<string> {
  if (from === to) {
    return text;
  }
  // Mock translation delay
  await new Promise((resolve) => setTimeout(resolve, 200));
  return "[" + to + " translation] " + text;
}
