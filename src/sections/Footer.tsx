"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, Twitter, Instagram, Facebook, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-black/10 bg-[#F9ECFE]">
      <div className="mx-auto max-w-[76rem] px-4 py-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4 text-center md:text-left">
            <Link href="/" aria-label="I Love Memes" className="inline-block">
              <div className="relative h-10 w-[180px] mx-auto md:mx-0">
                <Image
                  src="/brand/ilovememes-logo.png"
                  alt="I Love Memes"
                  fill
                  className="object-contain"
                  sizes="180px"
                  priority
                />
              </div>
            </Link>
            <p className="mt-3 text-sm text-black/70 max-w-xs mx-auto md:mx-0">
              Make, remix, and share memes in seconds. Fun made endless.
            </p>

            <div className="mt-5 flex items-center justify-center md:justify-start gap-3">
              <Link
                href="#"
                aria-label="Twitter"
                className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-[#300458] transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <Twitter className="h-4 w-4 transition-colors group-hover:text-black" />
              </Link>
              <Link
                href="#"
                aria-label="Instagram"
                className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-[#300458] transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <Instagram className="h-4 w-4 transition-colors group-hover:text-black" />
              </Link>
              <Link
                href="#"
                aria-label="Facebook"
                className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-[#300458] transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <Facebook className="h-4 w-4 transition-colors group-hover:text-black" />
              </Link>
              <Link
                href="#"
                aria-label="YouTube"
                className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-[#300458] transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <Youtube className="h-4 w-4 transition-colors group-hover:text-black" />
              </Link>
            </div>
          </div>

          <div className="md:col-span-4 text-center md:text-left">
            <h3 className="text-sm font-semibold text-[#300458]">Quick Links</h3>
            <ul className="mt-3 space-y-2 text-sm text-black/70">
              <li>
                <Link href="/templates" className="hover:text-black">
                  Templates
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-black">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/meme" className="hover:text-black">
                  Generate Meme
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.jewelrycandles.com/"
                  className="hover:text-black"
                  target="_blank"
                >
                  Meme Merch
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 text-center md:text-left">
            <h3 className="text-sm font-semibold text-[#300458]">Subscribe</h3>
            <p className="mt-3 text-sm text-black/70">
              Get the freshest meme templates and tips.
            </p>

            <form className="mt-4 flex items-center gap-2 justify-center md:justify-start">
              <div className="relative flex-1 max-w-[200px] md:max-w-none">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-full border border-black/10 bg-white px-9 py-2 text-sm outline-none focus:border-black/30"
                />
              </div>
              <button
                type="submit"
                className="rounded-full px-4 py-2 text-sm font-medium text-white shadow-sm"
                style={{
                  backgroundImage: "linear-gradient(90deg,#CD01BA,#E20317)",
                }}
              >
                Subscribe
              </button>
            </form>

            <p className="mt-3 text-sm text-black/70">
              Need help? Email{" "}
              <Link
                href="mailto:support@Ilovememes.com"
                className="underline hover:text-black"
              >
                support@Ilovememes.com
              </Link>
            </p>
          </div>
        </div>

        <hr className="mt-8 border-t border-black/10" />

        <div className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2">
            <p className="order-2 md:order-1 text-center md:text-left text-sm md:text-base font-semibold text-black md:col-span-1">
              © 2025 I Love Memes. All rights reserved.
            </p>

            <div className="hidden md:block md:order-2 md:col-span-1" />

            <div className="order-1 md:order-3 flex justify-center md:justify-end items-center gap-6 md:col-span-1">
              <Link
                href="#"
                className="text-sm md:text-base font-semibold text-black/80 hover:text-black"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-sm md:text-base font-semibold text-black/80 hover:text-black"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-sm md:text-base font-semibold text-black/80 hover:text-black"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
