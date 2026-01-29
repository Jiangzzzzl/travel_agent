import { AI } from './actions';
import './globals.css';

export const metadata = {
  title: 'Travel Agent - AI 旅游助手',
  description: '智能旅游规划助手',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">
        <AI>{children}</AI> 
      </body>
    </html>
  );
}