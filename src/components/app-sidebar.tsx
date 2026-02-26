"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Settings,
  Users,
  UsersRound,
  BarChart3,
  GraduationCap,
  BookOpen,
  FolderOpen,
  Coins,
  Gamepad2,
  Trophy,
  Award,
  Bot,
  Bell,
  Mail,
  Search,
  BookOpenCheck,
  Compass,
  Medal,
  LogOut,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeft,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/sidebar.context";
import { useAppSelector } from "@/hooks/redux.hook";
import { useLanguage } from "@/context/language.context";
import { createClient } from "@/utils/supabase/client";
import { resetUser } from "@/redux/user.slice";
import { rules } from "@/utils/constants/rulesEnums";
import { LanguageSwitcher } from "./languageSwithcer";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Sheet, SheetContent } from "./ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import { publicRoute, lmsAdminRoutes as lmsAdminRoutePaths } from "@/utils/routes";
import NotificationBell from "./notifications/NotificationBell";

// ─── Navigation definitions ─────────────────────────────────────────────────

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

const superAdminNav: NavGroup[] = [
  {
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Organizations", href: "/dashboard/organizations", icon: Building2 },
      { name: "Subscriptions", href: "/dashboard/subscriptions", icon: CreditCard },
    ],
  },
];

const orgAdminNav: NavGroup[] = [
  {
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Organization Settings", href: "/dashboard/organization-settings", icon: Settings },
      { name: "User Management", href: "/dashboard/user-management", icon: Users },
      { name: "Groups Management", href: "/dashboard/groups-management", icon: UsersRound },
      { name: "Email Config", href: "/dashboard/email-config", icon: Mail },
    ],
  },
];

const lmsAdminNav: NavGroup[] = [
  {
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Insights", href: "/dashboard/insights", icon: BarChart3 },
      { name: "Students", href: "/dashboard/students", icon: GraduationCap },
      { name: "Enrollments", href: "/dashboard/enrollments", icon: BookOpen },
    ],
  },
  {
    label: "Content",
    items: [
      { name: "Courses", href: "/dashboard/courses", icon: FolderOpen },
      { name: "Categories", href: "/dashboard/categories", icon: FolderOpen },
    ],
  },
  {
    label: "Gamification",
    items: [
      { name: "Points Config", href: "/dashboard/points-config", icon: Coins },
      { name: "Gamification", href: "/dashboard/gamification-config", icon: Gamepad2 },
      { name: "Leaderboard", href: "/dashboard/leaderboard-config", icon: Trophy },
      { name: "Badges", href: "/dashboard/badge-config", icon: Award },
    ],
  },
  {
    label: "Management",
    items: [
      { name: "Certificate Settings", href: "/dashboard/certificate-settings", icon: Medal },
    ],
  },
  {
    label: "AI",
    items: [{ name: "AI Config", href: "/dashboard/ai-config", icon: Bot }],
  },
  {
    label: "Communications",
    items: [{ name: "Notifications", href: "/dashboard/notification-settings", icon: Bell }],
  },
];

const learnerNav: NavGroup[] = [
  {
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Search", href: "/dashboard/search", icon: Search },
      { name: "Learn", href: "/dashboard/learn", icon: BookOpenCheck },
      { name: "Discover", href: "/dashboard/discover", icon: Compass },
    ],
  },
  {
    label: "Progress",
    items: [
      { name: "Certificates", href: "/dashboard/certificates", icon: Medal },
      { name: "Achievements", href: "/dashboard/achievements", icon: Award },
      { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
    ],
  },
];

const learningManagerNav: NavGroup[] = [
  {
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Insights", href: "/dashboard/insights", icon: BarChart3 },
      { name: "Students", href: "/dashboard/students", icon: GraduationCap },
      { name: "Enrollments", href: "/dashboard/enrollments", icon: BookOpen },
      { name: "Courses", href: "/dashboard/courses", icon: FolderOpen },
    ],
  },
];

function getNavForRole(role: string | null): NavGroup[] {
  switch (role) {
    case "superAdmin":
      return superAdminNav;
    case "organizationAdmin":
      return orgAdminNav;
    case "LMSAdmin":
      return lmsAdminNav;
    case "learningManager":
      return learningManagerNav;
    case "learner":
      return learnerNav;
    default:
      return learnerNav;
  }
}

// ─── Sidebar Component ──────────────────────────────────────────────────────

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { isRTL } = useLanguage();
  const { isOpen, isCollapsed, isMobile, toggle, setOpen } = useSidebar();
  const { theme, setTheme } = useTheme();

  const {
    settings: { logo },
    loading,
  } = useAppSelector((state) => state.organization);
  const { user } = useAppSelector((state) => state.user);

  const [role, setRole] = useState<string | null>(null);

  // Fetch user role
  useEffect(() => {
    if (user?.id) {
      (async () => {
        const supabase = createClient();
        const { data } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id!)
          .single();
        if (data?.role) setRole(data.role);
      })();
    }
  }, [user?.id]);

  const navGroups = useMemo(() => getNavForRole(role), [role]);

  const nonNavRoutes = useMemo(
    () => [...publicRoute, ...lmsAdminRoutePaths],
    []
  );

  const onLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    dispatch(resetUser());
    router.replace("/");
  }, [dispatch, router]);

  // Hide sidebar on public/auth routes and builder pages
  const shouldHide =
    nonNavRoutes.includes(pathname) ||
    pathname.startsWith("/dashboard/courses/add-course/build-course") ||
    pathname.startsWith("/dashboard/courses/preview-content") ||
    pathname.startsWith("/dashboard/courses/edit-content");

  if (shouldHide) return null;

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* ── Logo ── */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-white/[0.06] px-4",
          isCollapsed && !isMobile ? "justify-center px-3" : "gap-3"
        )}
      >
        <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
          {loading ? (
            <div className="h-7 w-20 animate-pulse rounded-md bg-white/[0.06]" />
          ) : (
            <Image
              src={logo as string}
              width={isCollapsed && !isMobile ? 28 : 110}
              height={28}
              alt="logo"
              className={cn(
                "h-auto w-auto brightness-0 invert opacity-90",
                isCollapsed && !isMobile ? "max-h-7 max-w-7" : "max-h-8"
              )}
              priority
            />
          )}
        </Link>

        {/* Collapse toggle (desktop only) */}
        {!isMobile && !isCollapsed && (
          <button
            className="ms-auto flex h-6 w-6 items-center justify-center rounded-md text-white/30 transition-colors hover:text-white/70 hover:bg-white/[0.06]"
            onClick={toggle}
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-3.5 w-3.5" />
          </button>
        )}
        {!isMobile && isCollapsed && (
          <button
            className="flex h-6 w-6 items-center justify-center rounded-md text-white/30 transition-colors hover:text-white/70 hover:bg-white/[0.06]"
            onClick={toggle}
            aria-label="Expand sidebar"
          >
            <PanelLeft className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* ── User Profile ── */}
      {user && (
        <div
          className={cn(
            "border-b border-white/[0.06] px-4 py-3",
            isCollapsed && !isMobile && "px-3 py-3 flex justify-center"
          )}
        >
          <Link
            href="/profile"
            className={cn(
              "flex items-center gap-2.5 group rounded-lg p-1.5 -m-1.5 transition-colors hover:bg-white/[0.04]",
              isCollapsed && !isMobile && "justify-center p-1 -m-1"
            )}
          >
            <Avatar
              className={cn(
                "shrink-0 ring-1 ring-white/10 transition-all group-hover:ring-white/25",
                isCollapsed && !isMobile ? "h-8 w-8" : "h-8 w-8"
              )}
            >
              <AvatarImage
                className="exclude-weglot"
                src={user?.avatar_url}
              />
              <AvatarFallback className="exclude-weglot bg-white/[0.08] text-white/80 text-[11px] font-medium">
                {user?.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {(!isCollapsed || isMobile) && (
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[13px] font-medium text-white/90">
                  {user?.name}
                </span>
                <span className="truncate text-[11px] text-white/40">
                  {role
                    ? rules[role as keyof typeof rules] || role
                    : ""}
                </span>
              </div>
            )}
          </Link>
        </div>
      )}

      {/* ── Navigation ── */}
      <ScrollArea className="flex-1 px-2.5 py-3">
        <TooltipProvider delayDuration={0}>
          <nav className="flex flex-col gap-0.5">
            {navGroups.map((group, gi) => (
              <div key={gi}>
                {group.label && (
                  <>
                    {gi > 0 && (
                      <div className="my-2.5 mx-2 h-px bg-white/[0.06]" />
                    )}
                    {!isCollapsed || isMobile ? (
                      <span className="mb-1.5 mt-1 block px-2.5 text-[10px] font-medium uppercase tracking-wider text-white/30">
                        {group.label}
                      </span>
                    ) : (
                      <div className="my-2.5 mx-2 h-px bg-white/[0.06]" />
                    )}
                  </>
                )}
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname === item.href ||
                        pathname.startsWith(item.href + "/");
                  const Icon = item.icon;

                  const linkContent = (
                    <Link
                      href={item.href}
                      onClick={() => isMobile && setOpen(false)}
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] font-medium transition-all duration-150",
                        isActive
                          ? "bg-white/[0.08] text-white"
                          : "text-white/50 hover:bg-white/[0.04] hover:text-white/80",
                        isCollapsed && !isMobile && "justify-center px-2"
                      )}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <span
                          className={cn(
                            "absolute top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-full bg-primary-400",
                            isRTL ? "right-0" : "left-0"
                          )}
                        />
                      )}
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive
                            ? "text-primary-400"
                            : "text-white/40 group-hover:text-white/60"
                        )}
                      />
                      {(!isCollapsed || isMobile) && (
                        <span className="truncate">{item.name}</span>
                      )}
                    </Link>
                  );

                  if (isCollapsed && !isMobile) {
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent
                          side={isRTL ? "left" : "right"}
                          className="font-medium"
                        >
                          {item.name}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return <div key={item.href}>{linkContent}</div>;
                })}
              </div>
            ))}
          </nav>
        </TooltipProvider>
      </ScrollArea>

      {/* ── Footer: Controls ── */}
      <div className="mt-auto border-t border-white/[0.06] p-2.5 space-y-0.5">
        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size={isCollapsed && !isMobile ? "icon" : "default"}
          className={cn(
            "w-full justify-start gap-2.5 text-[13px] text-white/45 hover:text-white/80 hover:bg-white/[0.04]",
            isCollapsed && !isMobile && "justify-center px-2"
          )}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 shrink-0" />
          ) : (
            <Moon className="h-4 w-4 shrink-0" />
          )}
          {(!isCollapsed || isMobile) && (
            <span>
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </Button>

        {/* Notifications */}
        <NotificationBell isCollapsed={isCollapsed} isMobile={isMobile} />

        {/* Language switcher */}
        <div
          className={cn(
            "flex items-center",
            isCollapsed && !isMobile ? "justify-center" : "px-2.5"
          )}
        >
          <LanguageSwitcher />
        </div>

        <div className="my-1.5 mx-2 h-px bg-white/[0.06]" />

        {/* Logout */}
        <Button
          variant="ghost"
          size={isCollapsed && !isMobile ? "icon" : "default"}
          className={cn(
            "w-full justify-start gap-2.5 text-[13px] text-white/45 hover:text-red-400 hover:bg-white/[0.04]",
            isCollapsed && !isMobile && "justify-center px-2"
          )}
          onClick={onLogout}
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {(!isCollapsed || isMobile) && (
            <span>Logout</span>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      {!isMobile && (
        <aside
          className={cn(
            "fixed inset-y-0 start-0 z-40 flex flex-col gradient-sidebar border-e border-white/[0.06] transition-[width] duration-200 ease-smooth",
            isCollapsed ? "w-sidebar-collapsed" : "w-sidebar"
          )}
        >
          {sidebarContent}
        </aside>
      )}

      {/* ── Mobile Header ── */}
      {isMobile && (
        <header className="sticky top-0 z-50 flex h-12 items-center gap-3 border-b border-border/60 bg-background/80 backdrop-blur-xl px-4">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle sidebar">
            <PanelLeft className="h-5 w-5" />
          </Button>
          <Link href="/dashboard">
            {!loading && (
              <Image
                src={logo as string}
                width={100}
                height={28}
                alt="logo"
                className="h-auto max-h-8 w-auto"
              />
            )}
          </Link>
        </header>
      )}

      {/* ── Mobile Sheet ── */}
      {isMobile && (
        <Sheet open={isOpen} onOpenChange={setOpen}>
          <SheetContent
            side={isRTL ? "right" : "left"}
            className="w-sidebar gradient-sidebar border-0 p-0"
          >
            {sidebarContent}
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
