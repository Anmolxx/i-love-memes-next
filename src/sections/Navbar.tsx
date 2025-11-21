"use client"

import GenericNavbar, { NavLinkItem } from "@/components/ui/extension/NavbarPlate";

export function Navbar() {

  const links: NavLinkItem[] = [
    { id: 1, label: "Home", href: "/" },
    { id: 2, label: "Templates", href: "/templates" },
    { id: 3, label: "Community", href: "/community" },
    { id: 4, label: "Meme Merch", href: "https://www.jewelrycandles.com/", external: true },
  ];

  const logo = {
    src:"/brand/ilovememes-logo.png",
    alt:"I Love Memes",
    href:"/"
  }

  const ctaButton = {
    label: "Generate Meme",
    href: "/meme",
    external: true,
  };

  return <GenericNavbar links={links} logo={logo} ctaButton={ctaButton} />;
}
