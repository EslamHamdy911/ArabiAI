import React, { useEffect, useRef } from 'react';
import { RefreshCw, Code } from 'lucide-react';

interface Props {
  code: string;
  lang: 'ar' | 'en';
}

export const CodePreview: React.FC<Props> = ({ code, lang }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const updatePreview = () => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        // Basic heuristic to detect if code is full HTML or partial
        let content = code;
        if (!code.includes('<!DOCTYPE html>') && !code.includes('<html>')) {
            content = `
                <!DOCTYPE html>
                <html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
                <head>
                    <meta charset="UTF-8">
                    <style>body { font-family: sans-serif; padding: 20px; }</style>
                </head>
                <body>
                    ${code}
                </body>
                </html>
            `;
        }
        doc.write(content);
        doc.close();
      }
    }
  };

  useEffect(() => {
    updatePreview();
  }, [code]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <Code size={16} />
          {lang === 'ar' ? 'معاينة التطبيق' : 'App Preview'}
        </h3>
        <button 
          onClick={updatePreview}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
          title={lang === 'ar' ? 'تحديث' : 'Refresh'}
        >
          <RefreshCw size={16} />
        </button>
      </div>
      <div className="flex-1 bg-white relative">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-none"
          title="Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
};