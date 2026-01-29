import { cn } from "@/lib/utils";
import { Bot, User, Sparkles } from "lucide-react";

interface ChatMessageProps {
  role: 'user' | 'assistant';
  children: React.ReactNode;
}

export function ChatMessage({ role, children }: ChatMessageProps) {
  return (
    <div className={cn(
      "flex w-full gap-4 animate-in-up",
      role === 'user' ? "justify-end" : "justify-start"
    )}>
      {role === 'assistant' && (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>
      )}
      
      <div className={cn(
        "rounded-2xl transition-all duration-200",
        role === 'user' 
          ? "bg-gradient-to-r from-slate-100 to-gray-100 text-gray-800 px-4 md:px-6 py-3 md:py-4 shadow-sm border border-gray-200/50 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg" 
          : "bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-900 p-4 md:p-6 shadow-lg max-w-full"
      )}>
        {children}
      </div>
      
      {role === 'user' && (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-gray-500 rounded-2xl flex items-center justify-center shadow-sm">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      )}
    </div>
  );
}
