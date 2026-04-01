"use client";

import { useRouter } from "next/navigation";
import useAuthentication from "@/hooks/use-authentication";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { LayoutDashboard, LogOut, LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/redux/store";
import { logout } from "@/redux/slices/auth";

interface UserHoverCardProps {
  meme?: boolean;
  template?: boolean;
}

export function UserHoverCard({ meme, template }: UserHoverCardProps) {
  const router = useRouter();
  const appDispatcher = useAppDispatch();
  const { isLoggedIn, isAdmin, user } = useAuthentication();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleLoginClick = () => {
    router.push("/auth/login");
  };

  if (!isLoggedIn) {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              className="hidden md:inline-flex px-4 py-2 rounded-full font-medium text-black border-[#4b087ea5] hover:bg-[#f8f0ff]"
            >
              Welcome
            </Button>
            <LogIn
                className="md:hidden h-6 w-6 text-[#4b087e] cursor-pointer"
                onClick={handleLoginClick}
            />
          </div>
        </HoverCardTrigger>

        <HoverCardContent className="w-48 cursor-pointer" onClick={handleLoginClick}>
          <div className="flex items-center gap-3">
            <LogIn className="h-6 w-6 text-[#4b087e]" />
            <div className="flex-1 text-sm font-medium">
              <p className="text-sm font-semibold hover:text-[#4b087e]">
                Login to your account
              </p>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  }

  const handleLogout = async () => {
    await appDispatcher(logout());
    router.push("/");
  };

  const handleDashboardClick = () => {
    let path = "/admin";
    if (template) {
      path = "/admin/templates";
    } else if (meme) {
      path = "/admin/meme";
    }
    router.push(path);
  };

  const getInitials = () => {
    if (isAdmin) return "AD";
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.firstName?.[0]?.toUpperCase() ?? "U";
  };

  if (isAdmin) {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="flex items-center">
            <Button variant="link" className="hidden md:inline-flex px-3 py-2 text-base text-[#4b087e]">
              Welcome, Admin
            </Button>
            <Avatar className="md:hidden h-9 w-9" onClick={handleDashboardClick}>
              <AvatarFallback className="bg-gradient-to-r from-[#CD01BA] to-[#E20317] text-white font-semibold text-xs">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </div>
        </HoverCardTrigger>

        <HoverCardContent className="w-64">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarFallback className="bg-gradient-to-r from-[#CD01BA] to-[#E20317] text-white font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold">Admin Dashboard</span>
              <p
                className="text-sm text-muted-foreground cursor-pointer hover:text-[#4b087e]"
                onClick={handleDashboardClick}
              >
                Go to Dashboard
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto cursor-pointer"
              onClick={handleDashboardClick}
            >
              <LayoutDashboard className="h-4 w-4" />
            </Button>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:inline-flex px-4 py-2 rounded-full font-medium text-black border-[#4b087ea5] hover:bg-[#f8f0ff]"
          >
            Welcome
          </Button>
          <Avatar className="md:hidden h-9 w-9">
            <AvatarFallback className="bg-gradient-to-r from-[#CD01BA] to-[#E20317] text-white font-semibold text-xs">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </div>
      </HoverCardTrigger>

      <HoverCardContent className="w-48">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-gradient-to-r from-[#CD01BA] to-[#E20317] text-white font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-sm font-medium">
            <p>Hello, {user?.firstName ?? "User"}</p>
            <p
              className="flex items-center gap-1 mt-1 cursor-pointer text-red-600 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" /> Logout
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
