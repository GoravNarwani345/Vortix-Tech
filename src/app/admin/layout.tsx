"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  LogOut,
  Menu,
  X,
  FileText,
  Star,
  Briefcase,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  PanelLeft,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import LogoMark from "@/components/layout/LogoMark";

const sidebarLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Portfolio", href: "/admin/portfolio", icon: Briefcase },
  { name: "Blog", href: "/admin/blog", icon: FileText },
  { name: "Testimonials", href: "/admin/testimonials", icon: Star },
  { name: "Feedback", href: "/admin/feedback", icon: MessageSquare },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Restore collapsed state preference from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("admin_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleSidebar = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem("admin_sidebar_collapsed", String(next));
    } catch {
      // ignore
    }
  };

  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  };

  const currentLink = sidebarLinks.find((l) =>
    l.href === "/admin"
      ? pathname === "/admin"
      : pathname === l.href || pathname.startsWith(l.href + "/")
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navbar with Sidebar Toggle Icon */}
      <header
        className={cn(
          "fixed top-0 right-0 h-16 bg-card-bg/90 backdrop-blur-md border-b border-card-border z-30 flex items-center justify-between px-4 sm:px-6 transition-all duration-300",
          mounted && isCollapsed ? "lg:left-20" : "lg:left-64",
          "left-0"
        )}
      >
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-card-border/40 transition-colors"
            title="Toggle Menu"
            aria-label="Toggle Menu"
          >
            {isMobileOpen ? <X size={20} /> : <PanelLeft size={20} />}
          </button>

          {/* Desktop Sidebar Collapse Toggle Button */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="hidden lg:flex p-2 rounded-xl text-foreground-muted hover:text-foreground hover:bg-card-border/40 transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>

          {/* Breadcrumb / Page Title */}
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="text-foreground-muted hidden sm:inline">Admin</span>
            <span className="text-foreground-muted hidden sm:inline">/</span>
            <span className="text-foreground font-semibold">
              {currentLink?.name || "Control Center"}
            </span>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
            <ShieldCheck size={13} />
            <span>Admin Active</span>
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-xs font-medium text-foreground-muted hover:text-foreground px-3 py-1.5 rounded-xl border border-card-border bg-background hover:bg-card-border/30 transition-all shadow-sm"
            title="Preview live public website in new tab"
          >
            <ExternalLink size={13} />
            <span className="hidden sm:inline">View Site</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-400 px-3 py-1.5 rounded-xl hover:bg-red-500/10 transition-colors"
            title="Sign out of admin session"
          >
            <LogOut size={14} />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-card-bg border-r border-card-border fixed top-0 bottom-0 left-0 z-40 transition-all duration-300",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            "h-16 flex items-center border-b border-card-border px-4 transition-all",
            isCollapsed ? "justify-center" : "justify-between px-5"
          )}
        >
          <Link href="/" className="flex items-center gap-2 group overflow-hidden">
            <LogoMark className="w-8 h-8 flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-base font-bold text-foreground truncate">
                Vortix<span className="text-accent">Admin</span>
              </span>
            )}
          </Link>

          {!isCollapsed && (
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-card-border/50 transition-colors"
              title="Collapse Sidebar"
              aria-label="Collapse Sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>

        {/* Sidebar Nav Links */}
        <div className="flex-1 py-4 px-3 flex flex-col gap-1.5 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname === link.href || pathname.startsWith(link.href + "/");

            return (
              <Link
                key={link.name}
                href={link.href}
                title={isCollapsed ? link.name : undefined}
                className={cn(
                  "flex items-center rounded-xl font-medium transition-all group",
                  isCollapsed
                    ? "justify-center p-3 text-center"
                    : "gap-3 px-3.5 py-2.5 text-sm",
                  isActive
                    ? "bg-accent/10 text-accent border border-accent/20 font-semibold"
                    : "text-foreground-muted hover:text-foreground hover:bg-card-border/40"
                )}
              >
                <Icon size={19} className="flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{link.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Footer Toggle / Signout in Sidebar */}
        <div className="p-3 border-t border-card-border flex flex-col gap-1">
          {isCollapsed ? (
            <button
              type="button"
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center p-3 rounded-xl text-foreground-muted hover:text-foreground hover:bg-card-border/40 transition-colors"
              title="Expand Sidebar"
            >
              <PanelLeftOpen size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={18} className="flex-shrink-0" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Backdrop & Menu */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer */}
          <div className="relative w-72 max-w-[85vw] bg-card-bg border-r border-card-border h-full flex flex-col z-10 shadow-2xl">
            <div className="h-16 flex items-center justify-between px-5 border-b border-card-border">
              <Link
                href="/"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-2"
              >
                <LogoMark className="w-8 h-8" />
                <span className="text-base font-bold text-foreground">
                  Vortix<span className="text-accent">Admin</span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="p-2 text-foreground-muted hover:text-foreground"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 py-4 px-3 flex flex-col gap-1.5 overflow-y-auto">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const isActive =
                  link.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === link.href || pathname.startsWith(link.href + "/");

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all",
                      isActive
                        ? "bg-accent/10 text-accent border border-accent/20 font-semibold"
                        : "text-foreground-muted hover:text-foreground hover:bg-card-border/40"
                    )}
                  >
                    <Icon size={19} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="p-4 border-t border-card-border">
              <button
                type="button"
                onClick={() => {
                  setIsMobileOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main
        className={cn(
          "flex-1 pt-16 min-h-screen transition-all duration-300",
          mounted && isCollapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        {children}
      </main>
    </div>
  );
}
