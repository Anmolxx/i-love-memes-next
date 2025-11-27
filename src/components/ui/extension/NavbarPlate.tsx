"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import NextImage from "next/image";
import { Menu, X } from "lucide-react";

export interface NavLinkItem {
  id: number;
  label: string;
  href: string;
  external?: boolean;
}

export interface LogoItem {
  src: string;
  alt: string;
  href: string;
}

interface NavbarProps {
  links: NavLinkItem[];
  ctaButton?: {
    label: string;
    href: string;
    external?: boolean;
  };
  logo?: LogoItem;
  className?: string;
  children?: React.ReactNode;
}

export default function Navbar({
  links,
  ctaButton,
  logo,
  className,
  children,
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className={cn("sticky top-0 z-50 bg-white/70 backdrop-blur-md", className)}>
      <div className="mx-auto max-w-[76rem] px-4 py-4 flex items-center justify-between relative">
        
        {/* Left Links (Desktop) */}
        <div className="hidden md:flex items-center gap-6 font-medium text-base font-serif">
          {links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              className="text-[#4b087ea5] hover:text-[#4b087e] transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Logo (Centered) */}
        {logo && (
          <div className="absolute left-1/2 transform -translate-x-1/2 flex-shrink-0">
            <Link href={logo.href} aria-label={logo.alt}>
              <NextImage
                src={logo.src}
                alt={logo.alt}
                width={180}
                height={40}
                className="object-contain"
              />
            </Link>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Children or CTA Button */}
          {children}
          {ctaButton && (
            <Link
              href={ctaButton.href}
              target={ctaButton.external ? "_blank" : undefined}
              className="hidden md:inline-block px-4 py-2 rounded-full bg-gradient-to-r from-[#CD01BA] to-[#E20317] text-white text-sm font-medium shadow-sm"
            >
              {ctaButton.label}
            </Link>
          )}

          {/* Hamburger for Mobile */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden px-4 pb-4 bg-white border-t border-gray-200">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                className="text-[#4b087ea5] hover:text-[#4b087e] font-medium text-base transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {ctaButton && (
              <Link
                href={ctaButton.href}
                target={ctaButton.external ? "_blank" : undefined}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-[#CD01BA] to-[#E20317] text-white text-sm font-medium shadow-sm mt-2 text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {ctaButton.label}
              </Link>
            )}

            {/* Render any children for mobile menu */}
            {children && <div>{children}</div>}
          </div>
        </div>
      )}
    </nav>
  );
}
