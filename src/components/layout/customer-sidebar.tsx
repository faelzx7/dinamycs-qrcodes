'use client'

import { LayoutDashboard, QrCode, LogOut, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

interface CustomerSidebarProps {
  user: {
    email: string
  }
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard", icon: QrCode, label: "Minhas Placas" },
]

export function CustomerSidebar({ user }: CustomerSidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const NavContent = () => (
    <div className="flex flex-col h-full bg-card border-r border-border/40">
      <div className="p-6">
        <h2 className="text-2xl font-bold tracking-tight mb-6">QR SaaS</h2>
        <nav className="space-y-2">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link key={`${item.href}-${index}`} href={item.href} onClick={() => setOpen(false)}>
                <span className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="mt-auto p-6 border-t border-border/40">
        <div className="mb-4">
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border/40 bg-card">
        <h2 className="text-xl font-bold">QR SaaS</h2>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="h-10 w-10 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[250px]">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>
      <div className="hidden md:block w-[250px] shrink-0 h-screen sticky top-0">
        <NavContent />
      </div>
    </>
  )
}
