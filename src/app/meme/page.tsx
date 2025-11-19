"use client";

import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);
  return <div />;
}
