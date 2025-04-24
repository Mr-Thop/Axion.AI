import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ApiProvider } from "./api-config"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ThemeSwitcher from "@/components/ThemeSwitcher"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Axion AI",
  description: "Streamline. Automate. Accelerate. Simplify Tasks, Maximize Results",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ApiProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <ThemeSwitcher />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ApiProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
