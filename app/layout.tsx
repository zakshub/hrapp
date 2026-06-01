import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Responsify HR",
  description: "Employee Accountability System",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}