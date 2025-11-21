"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, LogIn, LogOut } from "lucide-react";
import { Canvas } from "fabric";
import { useAppDispatch } from "@/redux/store";
import { useParams, useRouter } from "next/navigation";
import { logout } from "@/redux/slices/auth";
import useAuthentication from "@/hooks/use-authentication";
import MemeExportModal from "./MemeExportModal"; 
import MemeResetButton from "./MemeResetButton"; 
import SaveTemplateButton from "./SaveTemplateButton"; 
import UpdateTemplateButton from "./UpdateTemplateButton";
import { useGetTemplateByIdOrSlugQuery } from "@/redux/services/template";
import NavbarPlate from "@/components/ui/extension/NavbarPlate";
import Link from "next/link";
import NextImage from "next/image";

interface HeaderProps {
  canvasRef: React.RefObject<Canvas | null>;
  onReset: () => void;
  backgroundImageId?: string | null;
  templateSlugToEdit?: string;
}

const Header: React.FC<HeaderProps> = ({
  canvasRef,
  onReset,
  backgroundImageId,
}) => {
  const appDispatcher = useAppDispatch();
  const router = useRouter();
  const { isLoggedIn, isAdmin } = useAuthentication();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const { data: templateData } = useGetTemplateByIdOrSlugQuery(slug!, {
    skip: !slug || slug === "new",
  });
  const isEditMode = !!templateData?.data;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  async function handleLogout() {
    await appDispatcher(logout());
    router.push("/");
  }

  const handleLogin = () => {
    window.open("/auth/login", "_blank");
  };
  
  const handleOpenExportModal = () => {
    setIsExportModalOpen(true);
  };

  const navLinks = [
    { id: 1, label: "Home", href: "/" },
    { id: 2, label: "Templates", href: "/templates" },
    { id: 3, label: "Community", href: "/community" },
    { id: 4, label: "Meme Merch", href: "https://www.jewelrycandles.com/", external: true },
  ];

  return (
    <header className="relative w-full bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 h-20">
      
      <div className="flex items-center flex-1">
        <NavbarPlate links={navLinks} className="justify-center" />
      </div>

      <div className="absolute left-1/2 transform -translate-x-[45%]">
          <Link href="/" aria-label="I Love Memes">
            <div className="relative h-40 w-[140px] md:w-[180px]">
              <NextImage
                src="/brand/ilovememes-logo.png"
                alt="I Love Memes"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 140px, 180px"
                priority
              />
            </div>
          </Link>
        </div>

      <div className="flex items-center space-x-3 flex-1 justify-end min-w-[35%]">
        <MemeResetButton onReset={onReset} />

        {(isEditMode !== undefined && slug && isAdmin) ? (
          <UpdateTemplateButton
            canvasRef={canvasRef}
            templateSlug={slug}
            backgroundImageId={backgroundImageId}
          />
        ) : (isAdmin && !isEditMode ? (
          <SaveTemplateButton
            canvasRef={canvasRef}
            backgroundImageId={backgroundImageId}
          />
        ) : null)}

        <Button
          onClick={handleOpenExportModal}
          className="rounded-full h-10 px-6 md:px-8 text-white shadow-md text-sm md:text-base cursor-pointer"
          style={{
            backgroundImage: "linear-gradient(90deg,#CD01BA,#E20317)",
            boxShadow: "0 2px 8px rgba(205,1,186,0.5), 0 2px 8px rgba(226,3,23,0.5)",
          }}
        >
          Save & Download
          <Download className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="hidden md:flex items-center gap-4 ml-2">
        {mounted && isLoggedIn ? (
          <Button
            onClick={handleLogout}
            className="rounded-full cursor-pointer h-10 px-4 md:px-6 border-[#1E085C] text-[#1E085C] text-sm md:text-base flex items-center gap-2"
            variant="outline"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        ) : (
          <Button
            onClick={handleLogin}
            className="rounded-full cursor-pointer h-10 px-4 md:px-6 bg-[#1E085C] text-white text-sm md:text-base flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Login
          </Button>
        )}
      </div>

      <MemeExportModal
        isOpen={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        canvasRef={canvasRef}
        backgroundImageId={backgroundImageId}
      />
    </header>
  );
};

export default Header;
