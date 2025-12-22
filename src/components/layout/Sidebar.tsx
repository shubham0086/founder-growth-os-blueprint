import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  Target,
  FileText,
  Palette,
  Megaphone,
  Users,
  Zap,
  FlaskConical,
  BarChart3,
  Settings,
  BookOpen,
  Rocket,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Research Hub", href: "/research", icon: Search },
  { title: "Offer Blueprint", href: "/offer", icon: Target },
  { title: "Landing Pages", href: "/landing-pages", icon: FileText },
  { title: "Asset Factory", href: "/assets", icon: Palette },
  { title: "Campaigns", href: "/campaigns", icon: Megaphone },
  { title: "Leads", href: "/leads", icon: Users, badge: 12 },
  { title: "Automations", href: "/automations", icon: Zap },
  { title: "Experiments", href: "/experiments", icon: FlaskConical },
  { title: "Reports", href: "/reports", icon: BarChart3 },
  { title: "Documentation", href: "/docs", icon: BookOpen },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Rocket className="h-5 w-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <span className="font-semibold text-foreground text-sm">
                Growth OS
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const tutorialId = item.href === '/campaigns' ? 'nav-campaigns' : undefined;
            return (
              <Link
                key={item.href}
                to={item.href}
                data-tutorial={tutorialId}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/20 px-1.5 text-xs font-semibold text-primary">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Workspace Selector */}
        {!collapsed && (
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary font-semibold text-sm">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  Acme Fitness
                </p>
                <p className="text-xs text-muted-foreground">Local Service</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
