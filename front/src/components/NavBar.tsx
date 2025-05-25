"use client"

import Link from "next/link"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import Image from "next/image"
export function NavBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/logo.png"
            alt="QuizzHero Logo"
            width={40}
            height={40}
            className="object-contain"
            priority
          />
          <span className="font-bold">QuizzHero</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
          <Link href="/" className="transition-colors hover:text-foreground/80">Quiz</Link>
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
            <SheetTitle className="text-left flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="QuizzHero Logo"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
              <span className="font-bold">QuizzHero</span>
            </SheetTitle>
            <nav className="flex flex-col space-y-6 pt-6">
              <Link href="/" className="text-lg">Quiz</Link>
              {/* <Link href="/galery" className="text-lg">Galery</Link> */}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
} 
