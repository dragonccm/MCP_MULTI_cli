import './globals.css';

export const metadata = {
  title: 'AI Dev Team Workflow Dashboard',
  description: 'Visual workflow orchestrator with role/CLI routing, MCP status and rich project composer.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
