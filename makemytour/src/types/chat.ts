export type SenderType = 'user' | 'bot' | 'agent';

export type LanguageType = 'en' | 'es' | 'fr' | 'de' | 'zh'; // example languages

export interface Message {
  id: string;
  sender: SenderType;
  content: string;
  timestamp: number;
  language: LanguageType;
}

export interface ChatSession {
  sessionId: string;
  messages: Message[];
  language: LanguageType;
  escalated: boolean;
}
