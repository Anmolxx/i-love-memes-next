import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavLinkItem {
  id: number;
  label: string;
  href: string;
  external?: boolean;
}

interface NavbarProps {
  links: NavLinkItem[];
  ctaButton?: {
    label: string;
    href: string;
    external?: boolean;
  };
  className?: string;
}

export default function Navbar({ links, ctaButton, className }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className={cn("w-full sticky top-0 z-50 border-black/10 bg-white/70 backdrop-blur", className)}>
      <div className="mx-auto max-w-7xl px-4 py-5 relative">
        <div className="flex items-center justify-between">
          <button
            className="md:hidden p-2"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <div className="hidden md:flex items-center gap-6 text-base font-medium font-serif">
            {links.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                className="text-[#4b087ea5] hover:text-[#4b087e] transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

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

          <div className="hidden md:flex">
            {ctaButton && (
              <div
                className="rounded-full p-[3px]"
                style={{
                  background: 'linear-gradient(90deg,#CD01BA,#E20317)',
                  boxShadow: '0 2px 8px rgba(205,1,186,0.5), 0 2px 8px rgba(226,3,23,0.5)',
                }}
              >
                <Link
                  href={ctaButton.href}
                  target={ctaButton.external ? '_blank' : undefined}
                  className="flex items-center justify-center gap-2 px-3 py-2 md:px-4 rounded-full text-xs md:text-sm font-medium text-white shadow-sm"
                  style={{ backgroundImage: 'linear-gradient(90deg,#CD01BA,#E20317)' }}
                >
                  <span className="hidden sm:inline">{ctaButton.label}</span>
                  <span className="sm:hidden">{ctaButton.label.split(' ')[0]}</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-black/10 flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                onClick={closeMenu}
                target={link.external ? '_blank' : undefined}
                className="text-[#4b087ea5] hover:text-[#4b087e] transition-colors duration-200 font-bold font-serif"
              >
                {link.label}
              </Link>
            ))}
            {ctaButton && (
              <Link
                href={ctaButton.href}
                onClick={closeMenu}
                target={ctaButton.external ? '_blank' : undefined}
                className="mt-2 px-4 py-2 rounded-full bg-black text-white text-sm font-medium text-center"
              >
                {ctaButton.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
