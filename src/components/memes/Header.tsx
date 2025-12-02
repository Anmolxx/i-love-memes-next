"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, LogIn, LogOut, X, LayoutDashboard, RotateCcw, Save, Edit } from "lucide-react";
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
  templateId?: string | null;
}

const Header: React.FC<HeaderProps> = ({
  canvasRef,
  onReset,
  backgroundImageId,
  templateId
}) => {
  const appDispatcher = useAppDispatch();
  const router = useRouter();
  const { isLoggedIn, isAdmin } = useAuthentication();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      
      <div className="flex items-center flex-1 md:flex-initial">
        <NavbarPlate links={navLinks} className="justify-center -ml-5" />
      </div>

      <div className="absolute left-1/2 transform -translate-x-[50%]">
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

      {/* Desktop buttons (md and up) */}
      <div className="hidden md:flex items-center space-x-3 flex-1 justify-end min-w-[35%]">
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

      {/* Mobile icon buttons (hidden on md and up) */}
      <div className="flex md:hidden items-center gap-1 flex-1 justify-end">
        {/* Download icon button */}
        <button
          onClick={handleOpenExportModal}
          className="p-2 rounded-full hover:bg-gray-100 cursor-pointer transition-colors"
          title="Download"
        >
          <Download className="w-5 h-5 text-gray-700" />
        </button>

        {/* LayoutDashboard menu toggle button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-full hover:bg-gray-100 cursor-pointer transition-colors"
          title="More"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5 text-gray-700" />
          ) : (
            <LayoutDashboard className="w-5 h-5 text-gray-700" />
          )}
        </button>
      </div>

      {/* Mobile dropdown menu - Reset, Save/Update Template and Login/Logout */}
      {isMobileMenuOpen && (
        <div className="absolute top-20 right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 md:hidden w-56">
          <div className="flex flex-col p-3 gap-1">
            <button
              onClick={() => {
                onReset();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 text-sm text-gray-700 cursor-pointer transition-colors w-full text-left"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>

            {isEditMode !== undefined && slug && isAdmin && (
              <button
                onClick={() => {
                  // Close menu - UpdateTemplateButton will handle the action
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 text-sm text-gray-700 cursor-pointer transition-colors w-full text-left"
                title="Update Template"
              >
                <Edit className="w-4 h-4" />
                Update Template
              </button>
            )}

            {isAdmin && !isEditMode && (
              <button
                onClick={() => {
                  // Close menu - SaveTemplateButton will handle the action
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 text-sm text-gray-700 cursor-pointer transition-colors w-full text-left"
                title="Save Template"
              >
                <Save className="w-4 h-4" />
                Save Template
              </button>
            )}

            {((isEditMode !== undefined && slug && isAdmin) || (isAdmin && !isEditMode)) && (
              <div className="border-t border-gray-200 my-2" />
            )}

            {mounted && isLoggedIn ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 text-sm text-gray-700 cursor-pointer transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <button
                onClick={() => {
                  handleLogin();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 text-sm text-gray-700 cursor-pointer transition-colors w-full text-left"
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>
            )}
          </div>
        </div>
      )}

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
        templateId={templateId}
      />
    </header>
  );
};

export default Header;
