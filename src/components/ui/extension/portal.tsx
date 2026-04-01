"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    const el = document.body;
    setPortalRoot(el);
  }, []);

  if (!mounted || !portalRoot) return null;
  return createPortal(children, portalRoot);
}
