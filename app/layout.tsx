import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FiveM Prompt Maker',
  description: 'A shareable FiveM prompt-builder with DocsBot proxy support.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
