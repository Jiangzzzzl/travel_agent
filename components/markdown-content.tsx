import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content: string;
  themeColor?: string;
}

export function MarkdownContent({ content, themeColor = '#8B5CF6' }: MarkdownContentProps) {
  return (
    <div className="markdown-content max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 
              className="text-3xl font-black mb-4 mt-6 pb-3 border-b-4 rounded-sm"
              style={{ 
                borderColor: themeColor,
                background: `linear-gradient(135deg, ${themeColor}15, ${themeColor}08)`
              }}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 
              className="text-2xl font-black mb-3 mt-5 flex items-center gap-3"
              style={{ color: themeColor }}
            >
              <span 
                className="w-1.5 h-6 rounded-full"
                style={{ backgroundColor: themeColor }}
              />
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 
              className="text-xl font-bold mb-2 mt-4 px-4 py-2 rounded-xl"
              style={{ 
                background: `linear-gradient(135deg, ${themeColor}10, ${themeColor}05)`,
                borderLeft: `4px solid ${themeColor}`
              }}
            >
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-bold mb-2 mt-3 text-slate-800">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-base leading-relaxed mb-4 text-slate-700">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="space-y-2 mb-4 ml-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2 mb-4 ml-2 list-decimal list-inside">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-3 text-slate-700">
              <span 
                className="flex-shrink-0 w-2 h-2 rounded-full mt-2"
                style={{ backgroundColor: themeColor }}
              />
              <span className="flex-1">{children}</span>
            </li>
          ),
          strong: ({ children }) => (
            <strong 
              className="font-black px-1 rounded"
              style={{ color: themeColor }}
            >
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-600 not-italic font-medium">
              {children}
            </em>
          ),
          blockquote: ({ children }) => (
            <blockquote 
              className="border-l-4 pl-4 py-2 my-4 rounded-r-xl"
              style={{ 
                borderColor: themeColor,
                background: `linear-gradient(90deg, ${themeColor}08, transparent)`
              }}
            >
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code 
              className="px-2 py-1 rounded-lg text-sm font-mono"
              style={{ 
                background: `${themeColor}15`,
                color: themeColor
              }}
            >
              {children}
            </code>
          ),
          hr: () => (
            <hr 
              className="my-6 border-0 h-1 rounded-full"
              style={{ background: `linear-gradient(90deg, transparent, ${themeColor}40, transparent)` }}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
