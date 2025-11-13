"use client";
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Home, Users, FileText, ShoppingBag, Laugh, Shield } from "lucide-react";
import { NavUser } from "./nav-user";
import { usePathname } from "next/navigation";
import { isActivePath } from "@/lib/utils";
import Link from "next/link";
import useAuthentication from "@/hooks/use-authentication"; 

// Sidebar base links (visible to all)
const SIDEBAR_LINKS = [
  { title: "Home", url: "/", icon: Home },
  { title: "Community", url: "/community", icon: Users },
  { title: "Templates", url: "/meme", icon: FileText },
  { title: "Meme Merch", url: "/meme-merch", icon: ShoppingBag },
];

const USER = { name: "shadcn", email: "m@example.com", avatar: "/avatars/demo.png" };

export default function AppSidebar() {
  const pathname = usePathname();
  const { state, setOpenMobile } = useSidebar();
  const { user, isAdmin } = useAuthentication(); // ✅ from your auth hook

  const isOpen = state === "expanded";
  const toggleSidebar = () => {
    if (setOpenMobile) setOpenMobile(!isOpen);
  };

  // Build final link list conditionally
  const links = [...SIDEBAR_LINKS];
  if (isAdmin) {
    links.push({ title: "Admin", url: "/admin/meme", icon: Shield });
  }

  return (
    <Sidebar collapsible="icon">
      {/* Sidebar Header */}
      <SidebarHeader>
        <div className="flex items-center justify-between relative group px-2">
          <div className="flex items-center gap-2">
            <Laugh className="h-6 w-6 text-[#300458]" />
            {isOpen && <span className="text-base font-semibold whitespace-nowrap">I ❤️ Memes</span>}
          </div>

          {/* Trigger button */}
          {isOpen ? (
            <SidebarTrigger onClick={toggleSidebar} />
          ) : (
            <div className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <SidebarTrigger className="size-9" onClick={toggleSidebar} />
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((item) => {
                const active = isActivePath(item.url, pathname);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link
                        href={item.url}
                        className={`flex items-center gap-2 p-2 rounded hover:bg-gray-100 ${
                          active ? "bg-gray-200 opacity-100" : "opacity-80"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {isOpen && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter>
        <SidebarMenuItem>
          <NavUser user={user ?? USER} />
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}
