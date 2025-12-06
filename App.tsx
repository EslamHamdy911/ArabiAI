
import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Plus, Send, Mic, Image as ImageIcon, 
  Upload, Cpu, Download, FileCode, CheckCircle, WifiOff
} from 'lucide-react';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { CodePreview } from './components/CodePreview';
import { processLocalModelResponse } from './services/localService';
import { AppSettings, ChatSession, Message } from './types';

// Initial State
const defaultSettings: AppSettings = {
  theme: 'dark',
  language: 'ar',
  localModelName: null,
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
    const saved = localStorage.getItem('arabiai_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Clean up legacy mode if it exists in local storage
      delete parsed.mode;
      setSettings(parsed);
    }
    
    // Create new chat if none
    createNewChat();
  }, []);

  useEffect(() => {
    // Apply Theme
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'midnight');
    root.classList.add(settings.theme);
    
    // Apply Language Direction
    document.documentElement.lang = settings.language;
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    
    localStorage.setItem('arabiai_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, currentSessionId]);

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: settings.language === 'ar' ? 'محادثة جديدة' : 'New Chat',
      messages: [],
      createdAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setPreviewCode(null);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !currentSessionId) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    // Update UI immediately
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return { ...s, messages: [...s.messages, userMsg] };
      }
      return s;
    }));

    setInput('');
    setLoading(true);

    let responseText = '';
    
    try {
      if (!settings.localModelName) {
          responseText = settings.language === 'ar' 
              ? "الرجاء تحميل نموذج GGUF أولاً من القائمة الجانبية." 
              : "Please load a GGUF model first from the sidebar.";
      } else {
          responseText = await processLocalModelResponse(userMsg.content, settings.localModelName);
      }
    } catch (err) {
      responseText = "Error generating response.";
    }

    // Detect code block for preview
    const codeBlockMatch = responseText.match(/```(html|xml|javascript|css)?([\s\S]*?)```/);
    if (codeBlockMatch) {
      setPreviewCode(codeBlockMatch[2]);
    }

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: responseText,
      timestamp: Date.now(),
    };

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return { ...s, messages: [...s.messages, aiMsg] };
      }
      return s;
    }));
    setLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSettings(prev => ({ ...prev, localModelName: file.name }));
      // In a real app, pass file handle to Web Worker
    }
  };

  const handleInstallClick = () => {
    // Simulate install prompt
    alert(settings.language === 'ar' ? 'جاري تحضير ملف APK...' : 'Preparing APK for install...');
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);

  // Background Styles based on Theme
  const bgStyle = settings.theme === 'midnight' 
    ? 'bg-[#0f0f1a] text-gray-100' 
    : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100';
  
  const sidebarStyle = settings.theme === 'midnight'
    ? 'bg-[#1a1a2e] border-[#2a2a40]'
    : 'bg-gray-50 dark:bg-black border-gray-200 dark:border-gray-800';

  return (
    <div className={`flex h-screen overflow-hidden ${bgStyle} transition-colors duration-300`}>
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} flex-shrink-0 transition-all duration-300 border-r ${sidebarStyle} flex flex-col overflow-hidden relative`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
            <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
                ArabiAI <span className="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-500 px-1 rounded">Local</span>
            </h1>
            <button onClick={createNewChat} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full">
                <Plus size={20} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                {settings.language === 'ar' ? 'السجل' : 'History'}
            </div>
            {sessions.map(s => (
                <button
                    key={s.id}
                    onClick={() => setCurrentSessionId(s.id)}
                    className={`w-full text-start p-3 rounded-lg text-sm truncate transition-colors ${
                        currentSessionId === s.id 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium' 
                        : 'hover:bg-gray-200 dark:hover:bg-gray-800'
                    }`}
                >
                    {s.title}
                </button>
            ))}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-4">
            
            {/* Model Loader - Always Visible */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-800/50">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".gguf"
                    onChange={handleFileUpload}
                />
                {settings.localModelName ? (
                    <div className="flex flex-col items-center gap-2">
                        <Cpu size={24} className="text-green-500" />
                        <div className="text-sm font-semibold truncate max-w-[200px]">{settings.localModelName}</div>
                        <button 
                             onClick={() => fileInputRef.current?.click()}
                             className="text-xs text-blue-500 hover:underline"
                        >
                            {settings.language === 'ar' ? 'تغيير النموذج' : 'Change Model'}
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-2 w-full text-gray-500 hover:text-blue-500"
                    >
                        <Upload size={24} />
                        <span className="text-sm font-medium">{settings.language === 'ar' ? 'تحميل نموذج GGUF' : 'Load GGUF Model'}</span>
                        <span className="text-[10px] text-gray-400">{settings.language === 'ar' ? 'من ذاكرة الهاتف' : 'From Storage'}</span>
                    </button>
                )}
            </div>

            <div className="flex items-center justify-between">
                <ThemeSwitcher 
                    currentTheme={settings.theme} 
                    onThemeChange={(t) => setSettings(s => ({...s, theme: t}))} 
                    lang={settings.language}
                />
                <button 
                    onClick={() => setSettings(s => ({...s, language: s.language === 'ar' ? 'en' : 'ar'}))}
                    className="text-xs font-bold px-3 py-2 rounded-md bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700"
                >
                    {settings.language === 'ar' ? 'EN' : 'عربي'}
                </button>
            </div>

            <button 
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                <Download size={14} />
                {settings.language === 'ar' ? 'تثبيت التطبيق (APK)' : 'Install App'}
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Header */}
        <div className={`h-14 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 ${sidebarStyle}`}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 text-sm font-medium opacity-70">
                <WifiOff size={16} className="text-gray-500" />
                <span>{settings.localModelName || (settings.language === 'ar' ? 'لم يتم تحميل نموذج' : 'No Model Loaded')}</span>
            </div>
            <div className="w-8"></div> {/* Spacer */}
        </div>

        {/* Workspace: Split for Chat and Preview */}
        <div className="flex-1 flex overflow-hidden">
            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${previewCode ? 'hidden md:flex md:w-1/2' : 'w-full'}`}>
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {currentSession?.messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center opacity-50 space-y-4">
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                                <Upload size={32} className="text-gray-400" />
                            </div>
                            <p className="text-lg font-medium">
                                {settings.language === 'ar' ? 'مرحباً بك في الوضع المحلي' : 'Welcome to Local Mode'}
                            </p>
                            {!settings.localModelName && (
                                <p className="text-sm text-red-400">
                                    {settings.language === 'ar' ? 'يرجى تحميل نموذج للبدء' : 'Please load a model to start'}
                                </p>
                            )}
                        </div>
                    )}
                    
                    {currentSession?.messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                             <div 
                                className={`max-w-[85%] rounded-2xl p-4 shadow-sm whitespace-pre-wrap leading-relaxed ${
                                    msg.role === 'user' 
                                    ? 'bg-blue-600 text-white rounded-br-none' 
                                    : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-bl-none'
                                }`}
                             >
                                {msg.content}
                             </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-end">
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-bl-none border border-gray-100 dark:border-gray-700 animate-pulse flex gap-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <div className={`flex items-center gap-2 p-2 rounded-xl border border-gray-300 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500 bg-transparent`}>
                         <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                            <ImageIcon size={20} />
                         </button>
                         <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                            <FileCode size={20} />
                         </button>
                         <input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder={settings.language === 'ar' ? 'اكتب رسالتك هنا...' : 'Type your message here...'}
                            className="flex-1 bg-transparent outline-none px-2 text-sm"
                            disabled={!settings.localModelName}
                         />
                         <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                            <Mic size={20} />
                         </button>
                         <button 
                            onClick={handleSendMessage}
                            disabled={loading || !input.trim() || !settings.localModelName}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                         >
                            <Send size={18} className={settings.language === 'ar' ? 'rotate-180' : ''} />
                         </button>
                    </div>
                    <div className="text-center mt-2">
                         <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                             <WifiOff size={10} />
                             {settings.language === 'ar' ? 'وضع عدم الاتصال - يعمل بدون انترنت' : 'Offline Mode - No Internet Required'}
                         </p>
                    </div>
                </div>
            </div>

            {/* Preview Area (Visible if code exists) */}
            {previewCode && (
                <div className="w-full md:w-1/2 h-full border-s border-gray-200 dark:border-gray-800">
                     <CodePreview code={previewCode} lang={settings.language} />
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default App;
