"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import useAuthentication from "@/hooks/use-authentication";

export function CreateMemeCard() {
  const { user, isLoggedIn } = useAuthentication();

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null; 

  return (
    <div className="bg-gradient-to-r from-[#CD01BA] to-[#E20317] backdrop-blur-md p-4 rounded-2xl shadow border-1 text-white">
      {isLoggedIn ? (
        <div className="flex flex-col gap-3 text-center">
          <p className="text-base sm:text-lg font-semibold text-white">Create your own meme!</p>
          <Link href="/meme">
            <Button variant="default" className="w-full cursor-pointer rounded-full bg-white text-[#E20317] hover:bg-white ">
              <Plus className="w-4 h-4 mr-2" /> Create Meme
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3 text-center">
          <p className="text-gray-700 font-medium">Login to create memes.</p>
          <Link href="/auth/login">
            <Button variant="default" className="w-full cursor-pointer">
              Login
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
