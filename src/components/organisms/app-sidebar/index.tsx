"use client";
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
} from "@/components/ui/sidebar";
import {isActivePath} from "@/lib/utils";
import {FileChartColumnIncreasing, Laugh, LayoutTemplate, Settings, Users} from "lucide-react"
import Link from "next/link";
import {usePathname} from "next/navigation";
import {NavUser} from "./nav-user";

// Menu items.
const SIDEBAR_LINKS = [
  {
    title: "Meme",
    url: "/admin/meme",
    icon: Laugh,
  },
  {
    title: "Template",
    url: "/admin/templates",
    icon: LayoutTemplate,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
  },
 {
    title: "Media",
    url: "/admin/media",
    icon: FileChartColumnIncreasing,
  },
  {
    title: "Settings",
    url: "/admin/settings/store",
    icon: Settings
  }
];

const USER =  {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/demo.png",
};

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/">
                <span className="text-base font-semibold">I ❤️ Memes</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      {/* Main sidebar content */}
      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Application</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {SIDEBAR_LINKS.map((item) => {
                const isActive = isActivePath(item.url, pathname);

                return <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={item.url} className={isActive ? "opacity-100" : "opacity-80"}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuItem>
          <NavUser user={USER} />
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}
