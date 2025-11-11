"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import LoginPage from "@/app/auth/login/page";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[450px] max-w-full p-6 rounded-xl shadow-xl bg-gray-950 flex flex-col items-center justify-center"
      >
        <DialogHeader className="mb-4 text-center">
          <DialogTitle className="text-2xl font-semibold text-white">
            Welcome Back
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Please sign in to continue
          </DialogDescription>
        </DialogHeader>
        <div className="w-full">
          <LoginPage />
        </div>
      </DialogContent>
    </Dialog>
  );
};
