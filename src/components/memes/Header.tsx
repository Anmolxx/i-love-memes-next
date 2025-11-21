"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";
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

  const linkClassName = "text-[#4b087ea5] hover:text-[#4b087e] transition-colors duration-200 text-sm font-semibold whitespace-nowrap";

  return (
    <header className="relative w-full bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 py-4 h-20">
      <nav className="flex items-center gap-6 flex-1 justify-start min-w-[30%] text-sm font-medium font-serif">
        {isAdmin ? (
          <Link href="/admin/meme" className={linkClassName}>
            Admin
          </Link>
        ) : (
          <Link href="/" className={linkClassName}>
            Home
          </Link>
        )}
        
        <Link 
          href="/templates" 
          className={linkClassName}
        >
          Templates
        </Link>
        
        <Link 
          href="/community" 
          className={linkClassName}
        >
          Community
        </Link>
        
        <Link 
          href="https://www.jewelrycandles.com/" 
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkClassName} flex items-center gap-1`}
        >
          Meme Merch
          <ExternalLink className="w-3 h-3" />
        </Link>
      </nav>

      <Link href="/" className="absolute left-1/2 transform -translate-x-1/2 z-10">
        <div className="relative h-10 w-[160px] flex-shrink-0">
          <Image
            src="/brand/ilovememes-logo.png"
            alt="I Love Memes"
            fill
            className="object-contain"
            sizes="160px"
            priority
          />
        </div>
      </Link>

      <div className="flex items-center space-x-3 flex-1 justify-end min-w-[30%]">
        <MemeResetButton onReset={onReset} />

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
            boxShadow:
              "0 2px 8px rgba(205,1,186,0.5), 0 2px 8px rgba(226,3,23,0.5)",
          }}
        >
          Save & Download
          <Download className="w-4 h-4 ml-2" />
        </Button>
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