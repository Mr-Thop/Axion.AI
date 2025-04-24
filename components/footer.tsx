import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full border-t py-6">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © {new Date().getFullYear()} Axion AI.
        </p>
        <nav className="flex items-center space-x-4">
        </nav>
      </div>
    </footer>
  )
}
