"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useTypedSelector, useAppDispatch } from "@/redux/store";
import { setOpen } from "@/redux/slices/authModal/index";
import LoginPage from "@/app/auth/login/page";
import useAuthentication from "@/hooks/use-authentication";

export const AuthModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const open = useTypedSelector((state) => state.authModal.open);
  const { isLoggedIn } = useAuthentication();

  React.useEffect(() => {
    if (isLoggedIn && open) {
      dispatch(setOpen(false));
    }
  }, [isLoggedIn, open, dispatch]);

  const handleOpenChange = (value: boolean) => {
    dispatch(setOpen(value));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[450px] max-w-full p-6 rounded-xl shadow-xl bg-gray-950 flex flex-col items-center justify-center">
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
