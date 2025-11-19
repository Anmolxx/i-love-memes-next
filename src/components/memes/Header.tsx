// components/Header.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
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
  templateSlugToEdit,
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

  const handleOpenExportModal = () => {
    setIsExportModalOpen(true);
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-6 space-y-3 md:space-y-0">
      {/* Left: Logo */}
      <div className="flex items-center space-x-3 w-full md:w-auto justify-center md:justify-start">
        <Link href="/" aria-label="I Love Memes">
          <div className="relative h-8 w-[140px] md:w-[180px]">
            <Image
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

      {/* Right: Buttons */}
      <div className="flex items-center space-x-3 w-full md:w-auto justify-center md:justify-end">
        {/* 1. Reset Button (Modular Component) */}
        <MemeResetButton onReset={onReset} />

        {/* 2. Logout Button */}
        {mounted && isLoggedIn && (
          <Button
            onClick={handleLogout}
            className="rounded-full cursor-pointer h-10 px-4 md:px-6 border-[#1E085C] text-[#1E085C] text-sm md:text-base"
            variant="outline"
          >
            Logout
          </Button>
        )}

        {(isEditMode !== undefined && slug && isAdmin) ? (
          <UpdateTemplateButton
            canvasRef={canvasRef}
            templateSlug={slug}
            backgroundImageId={backgroundImageId}
          />
        ) : (slug && !isEditMode ? (
          <SaveTemplateButton
            canvasRef={canvasRef}
            backgroundImageId={backgroundImageId}
          />
        ) : null)}
        
        {/* 4. Save & Download Button (Opens the Modal, the Modal handles all logic) */}
        <Button
          onClick={handleOpenExportModal}
          className="rounded-full h-10 px-6 md:px-8 text-white shadow-md text-sm md:text-base cursor-pointer"
          style={{
            backgroundImage: "linear-gradient(90deg,#CD01BA,#E20317)",
            boxShadow:
              "0 2px 8px rgba(205,1,186,0.5), 0 2px 8px rgba(226,3,23,0.5)",
          }}
        >
          Save & Download
          <Download className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* 5. Export Modal (Modular Component) */}
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
