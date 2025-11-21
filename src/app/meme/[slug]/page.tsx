"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function SlugPage() {
  const pathname = usePathname();
  const isInitialMount = useRef(true); 

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      if (typeof window !== 'undefined') {
        window.location.reload(); 
      }
    }
  }, [pathname]);

  return <div />;
}