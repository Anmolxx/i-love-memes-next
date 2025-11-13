"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useTypedSelector } from "@/redux/store";
import { setOpen } from "@/redux/slices/authModal/index";
import { AuthModal } from "@/components/ui/extension/auth-modal"; // adjust path if needed

export default function AuthPage() {
  const dispatch = useAppDispatch();
  const isModalOpen = useTypedSelector((state) => state.authModal.open);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white space-y-4">
      <h1 className="text-3xl font-bold">Welcome to I ❤️ Memes</h1>
      <p className="text-gray-300">
        Click below to login and start creating memes!
      </p>

      <Button
        onClick={() => dispatch(setOpen(true))}
        className="bg-pink-500 hover:bg-pink-600"
      >
        Open Auth Modal
      </Button>

      {/* Mount the modal here */}
      <AuthModal />

      {isModalOpen && (
        <p className="text-gray-400 mt-2">The modal is currently open.</p>
      )}
    </div>
  );
}
