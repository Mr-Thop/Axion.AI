"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./mode-toggle"
import { Menu, X } from "lucide-react"
import { ApiStatusIndicator } from "./api-status-indicator"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">Axion AI</span>
        </Link>
        <nav className="hidden md:flex md:items-center md:space-x-6">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
            Home
          </Link>
          <Link href="/resume-analyzer" className="text-sm font-medium transition-colors hover:text-primary">
            Resume Analyzer
          </Link>
          <Link href="/interview-scheduler" className="text-sm font-medium transition-colors hover:text-primary">
            Interview Scheduler
          </Link>
          <Link href="/document-analyzer" className="text-sm font-medium transition-colors hover:text-primary">
            Document Analyzer
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <ApiStatusIndicator />
          <ModeToggle />
          <Button className="hidden md:flex" asChild>
            <Link href="/resume-analyzer">Get Started</Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="container md:hidden">
          <nav className="flex flex-col space-y-4 py-4">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link href="/resume-analyzer" className="text-sm font-medium transition-colors hover:text-primary">
              Resume Analyzer
            </Link>
            <Link href="/interview-scheduler" className="text-sm font-medium transition-colors hover:text-primary">
              Interview Scheduler
            </Link>
            <Link href="/document-analyzer" className="text-sm font-medium transition-colors hover:text-primary">
              Document Analyzer
            </Link>
            <Button asChild>
              <Link href="/resume-analyzer">Get Started</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
