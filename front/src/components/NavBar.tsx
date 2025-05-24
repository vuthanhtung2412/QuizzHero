"use client"

import Link from "next/link"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function NavBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold">Tech Europe</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
          <Link href="/about" className="transition-colors hover:text-foreground/80">About</Link>
          <Link href="/blog" className="transition-colors hover:text-foreground/80">Blog</Link>
          <Link href="/docs" className="transition-colors hover:text-foreground/80">Docs</Link>
        </nav>

        {/* Mobile nav */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[80%] max-w-sm">
            <SheetTitle className="text-left">Navigation Menu</SheetTitle>
            <nav className="flex flex-col space-y-6 pt-6">
              <Link href="/" className="text-lg">Quiz</Link>
              <Link href="/galery" className="text-lg">Galery</Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
} 
