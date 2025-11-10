"use client"

import NextImage from 'next/image'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, LogIn } from 'lucide-react'
import useAuthentication from '@/hooks/use-authentication'
import { useAppDispatch } from "@/redux/store"
import { logout } from "@/redux/slices/auth"

export function Navbar() {
  const { isLoggedIn } = useAuthentication()
  const router = useRouter()
  const appDispatcher = useAppDispatch()

  const handleAuthAction = async () => {
    if (isLoggedIn) {
      await appDispatcher(logout())
      router.push('/')
    } else {
      router.push('/auth/login')
    }
  }

  return (
    <div className="relative">
      <nav className="w-full sticky top-0 z-50 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-2 flex items-center gap-6">
          <Link href="/">
            <div className="relative h-15 w-30 flex-shrink-0">
              <NextImage
                src="/brand/ilovememes-logo.png"
                alt="I Love Memes"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Search bar next to logo */}
          <div className="flex-1 max-w-[640px]">
            <Input placeholder="Search Memes" className="h-10" />
          </div>

          {/* Actions on the right */}
          <div className="flex items-center gap-4">
            <Link
              href="/meme"
              className="flex items-center justify-center gap-2 px-3 py-2 md:px-4 rounded-full text-xs md:text-sm font-medium text-white shadow-sm"
              style={{
                background: 'linear-gradient(90deg,#CD01BA,#E20317)',
                boxShadow: '0 2px 8px rgba(205,1,186,0.5), 0 2px 8px rgba(226,3,23,0.5)',
              }}
            >
              <span className="hidden sm:inline">Generate Meme</span>
              <span className="sm:hidden">Generate</span>
            </Link>

            <button
              onClick={handleAuthAction}
              className="flex items-center cursor-pointer justify-center gap-2 px-3 py-2 md:px-4 rounded-full text-xs md:text-sm font-medium text-white shadow-sm"
              style={{
                background: 'linear-gradient(90deg,#CD01BA,#E20317)',
                boxShadow: '0 2px 8px rgba(205,1,186,0.5), 0 2px 8px rgba(226,3,23,0.5)',
              }}
            >
              {isLoggedIn ? (
                <>
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Login</span>
                </>
              )}
            </button>
          </div>
        </div>
      </nav>
    </div>
  )
}
