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
  Search,
  BookOpenCheck,
  Compass,
  Medal,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
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
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { publicRoute, lmsAdminRoutes as lmsAdminRoutePaths } from "@/utils/routes";

// ─── Navigation definitions with icons ───────────────────────────────────────

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
    label: "AI",
    items: [{ name: "AI Config", href: "/dashboard/ai-config", icon: Bot }],
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

// ─── Sidebar Component ───────────────────────────────────────────────────────

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

  const CollapseIcon = isRTL
    ? isCollapsed
      ? ChevronLeft
      : ChevronRight
    : isCollapsed
    ? ChevronRight
    : ChevronLeft;

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* ── Logo ── */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-sidebar-border px-4",
          isCollapsed && !isMobile ? "justify-center px-2" : "gap-3"
        )}
      >
        <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded bg-sidebar-muted" />
          ) : (
            <Image
              src={logo as string}
              width={isCollapsed && !isMobile ? 32 : 120}
              height={32}
              alt="logo"
              className={cn(
                "h-auto w-auto",
                isCollapsed && !isMobile ? "max-h-8 max-w-8" : "max-h-10"
              )}
              priority
            />
          )}
        </Link>

        {/* Collapse toggle (desktop only) */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "ms-auto h-7 w-7 text-sidebar-muted-foreground hover:text-sidebar-foreground",
              isCollapsed && "ms-0"
            )}
            onClick={toggle}
          >
            {isCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* ── Navigation ── */}
      <ScrollArea className="flex-1 px-3 py-4">
        <TooltipProvider delayDuration={0}>
          <nav className="flex flex-col gap-1">
            {navGroups.map((group, gi) => (
              <div key={gi}>
                {group.label && (
                  <>
                    {gi > 0 && <Separator className="my-3 bg-sidebar-border" />}
                    {!isCollapsed || isMobile ? (
                      <span className="mb-2 block px-3 text-tiny font-medium uppercase tracking-wider text-sidebar-muted-foreground">
                        {group.label}
                      </span>
                    ) : (
                      <Separator className="my-3 bg-sidebar-border" />
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
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-muted hover:text-sidebar-foreground",
                        isCollapsed && !isMobile && "justify-center px-2"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive
                            ? "text-sidebar-accent-foreground"
                            : "text-sidebar-muted-foreground group-hover:text-sidebar-foreground"
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

      {/* ── Footer: User + Controls ── */}
      <div className="mt-auto border-t border-sidebar-border p-3">
        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size={isCollapsed && !isMobile ? "icon" : "default"}
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-muted",
            isCollapsed && !isMobile && "justify-center px-2"
          )}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 shrink-0" />
          ) : (
            <Moon className="h-4 w-4 shrink-0" />
          )}
          {(!isCollapsed || isMobile) && (
            <span className="text-sm">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </Button>

        {/* Language switcher */}
        <div
          className={cn(
            "mt-1 flex items-center",
            isCollapsed && !isMobile ? "justify-center" : "px-3"
          )}
        >
          <LanguageSwitcher />
        </div>

        <Separator className="my-2 bg-sidebar-border" />

        {/* User */}
        {user ? (
          <div
            className={cn(
              "flex items-center gap-3",
              isCollapsed && !isMobile && "flex-col gap-2"
            )}
          >
            <Link href="/profile">
              <Avatar className="h-8 w-8 cursor-pointer exclude-weglot">
                <AvatarImage
                  className="exclude-weglot"
                  src={user?.avatar_url}
                />
                <AvatarFallback className="exclude-weglot text-xs">
                  {user?.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </Link>
            {(!isCollapsed || isMobile) && (
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-sidebar-foreground">
                  {user?.name}
                </span>
                <span className="truncate text-tiny text-sidebar-muted-foreground">
                  {role
                    ? rules[role as keyof typeof rules] || role
                    : ""}
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="ms-auto h-7 w-7 text-sidebar-muted-foreground hover:text-destructive"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Link href="/login">
            <Button size="sm" className="w-full">
              Login
            </Button>
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      {!isMobile && (
        <aside
          className={cn(
            "fixed inset-y-0 start-0 z-40 flex flex-col border-e border-sidebar-border bg-sidebar transition-[width] duration-200",
            isCollapsed ? "w-sidebar-collapsed" : "w-sidebar"
          )}
        >
          {sidebarContent}
        </aside>
      )}

      {/* ── Mobile Hamburger ── */}
      {isMobile && (
        <header className="sticky top-0 z-50 flex h-14 items-center gap-3 border-b bg-background px-4">
          <Button variant="ghost" size="icon" onClick={toggle}>
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
            className="w-sidebar bg-sidebar p-0"
          >
            {sidebarContent}
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
