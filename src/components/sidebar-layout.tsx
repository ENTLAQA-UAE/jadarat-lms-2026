"use client";

import { cn } from "@/lib/utils";
import { SidebarProvider, useSidebar } from "@/context/sidebar.context";
import AppSidebar from "./app-sidebar";

function SidebarLayoutInner({ children }: { children: React.ReactNode }) {
  const { isCollapsed, isMobile } = useSidebar();

  return (
    <>
      <AppSidebar />
      <main
        id="main-content"
        className={cn(
          "min-h-screen transition-[margin] duration-200",
          !isMobile && "ms-[var(--sidebar-width)]",
          !isMobile && isCollapsed && "ms-[var(--sidebar-width-collapsed)]"
        )}
      >
        {children}
      </main>
    </>
  );
}

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <SidebarLayoutInner>{children}</SidebarLayoutInner>
    </SidebarProvider>
  );
}
