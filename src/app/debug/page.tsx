"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/ui/extension/auth-modal";

export default function TestAuthModalPage() {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Button onClick={() => setAuthModalOpen(true)}>Open Auth Modal</Button>

      <AuthModal open={isAuthModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
}
