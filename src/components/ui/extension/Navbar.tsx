"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <nav className="w-full sticky top-0 z-50 border-b border-black/10 bg-white/70 backdrop-blur">
            <div className="mx-auto max-w-[92rem] px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Mobile menu button */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>

                    {/* Desktop navigation - left side */}
                    <div className="hidden md:flex items-center gap-4 text-base font-bold font-serif">
                      <Link 
                        href="/" 
                        className="text-[#4b087ea5] hover:text-[#4b087e] transition-colors duration-200"
                      >
                        Home
                      </Link>
                      <Link 
                          href="/meme" 
                          className="text-[#4b087ea5] hover:text-[#4b087e] transition-colors duration-200"
                        >
                          Create Humour
                        </Link>
                      <Link 
                        href="/templates" 
                        className="text-[#4b087ea5] hover:text-[#4b087e] transition-colors duration-200"
                      >
                        Templates
                      </Link>
                      <Link 
                        href="/community" 
                        className="text-[#4b087ea5] hover:text-[#4b087e] transition-colors duration-200"
                      >
                        Community
                      </Link>
                      <Link 
                        href="https://www.jewelrycandles.com/" 
                        className="text-[#4b087ea5] hover:text-[#4b087e] transition-colors duration-200"
                      >
                        Meme Merch
                      </Link>
                    </div>

                    {/* Logo - centered with absolute positioning to account for mobile button */}
                    <div className="absolute left-1/2 transform -translate-x-1/2">
                        <Link href="/" aria-label="I Love Memes">
                            <div className="relative h-8 w-[140px] md:w-[180px]">
                                <Image
                                    src="/brand/ilovememes-logo.png"
                                    alt="I Love Memes"
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 768px) 140px, 180px"
                                    priority
                                />
                            </div>
                        </Link>
                    </div>

                    <div className="flex justify-end">
                    <div
                        className="rounded-full p-[3px]"
                        style={{
                          background: 'linear-gradient(90deg,#CD01BA,#E20317)',
                          boxShadow: '0 2px 8px rgba(205,1,186,0.5), 0 2px 8px rgba(226,3,23,0.5)',
                        }}
                      >
                        <Link
                          href="/meme"
                          className="flex items-center justify-center gap-2 px-3 py-2 md:px-4 rounded-full text-xs md:text-sm font-medium text-white shadow-sm"
                          style={{ backgroundImage: 'linear-gradient(90deg,#CD01BA,#E20317)' }}
                          target='_blank'
                        >
                          <span className="hidden sm:inline">Generate Meme</span>
                          <span className="sm:hidden">Generate</span>
                        </Link>
                      </div>
                    </div>
                    
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 border-t border-black/10">
                        <div className="flex flex-col gap-4 pt-4">
                            <Link 
                                href="/" 
                                className="hover:text-black/80 text-black/60 py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link 
                                href="/meme" 
                                className="hover:text-black/80 text-black/60 py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Templates
                            </Link>
                            <Link 
                                href="/community" 
                                className="hover:text-black/80 text-black/60 py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Community
                            </Link>
                            <Link 
                                href="/merch" 
                                className="hover:text-black/80 text-black/60 py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Meme Merch
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}