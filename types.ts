
export type Theme = 'light' | 'dark' | 'midnight';
export type Language = 'ar' | 'en';

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  type?: 'text' | 'code' | 'error';
  codeLanguage?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export interface AppSettings {
  theme: Theme;
  language: Language;
  localModelName: string | null;
}

export interface CodeSnippet {
  language: string;
  code: string;
}
