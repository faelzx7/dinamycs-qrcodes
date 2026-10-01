'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, QrCode, Plus, Package, BarChart3, Menu, LogOut, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { APP_NAME } from '@/lib/constants'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/qr', label: 'QR Codes', icon: QrCode },
  { href: '/admin/qr-generator', label: 'Gerador', icon: Plus },
  { href: '/admin/batches', label: 'Lotes', icon: Package },
  { href: '/admin/scans', label: 'Scans', icon: BarChart3 },
]

export function AdminSidebar({ user }: { user: { email: string } }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-slate-950 text-slate-300">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <QrCode className="h-6 w-6" />
          {APP_NAME} Admin
        </h2>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/admin')
          
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive 
                  ? 'bg-slate-800 text-white' 
                  : 'hover:bg-slate-900 hover:text-white'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-slate-400')} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="mb-4 truncate text-sm text-slate-400">
          {user.email}
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="md:hidden flex items-center justify-between bg-slate-950 p-4 text-white">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Admin
        </h2>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-slate-300 hover:bg-slate-800 hover:text-white">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-slate-950 border-r-slate-800">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 border-r border-slate-800">
        <SidebarContent />
      </div>
    </>
  )
}
