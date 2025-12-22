import { Button } from "@/components/ui/button";
import { 
  Search, 
  Target, 
  FileText, 
  Palette, 
  Plus,
  Sparkles 
} from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  {
    title: "Run Research Scan",
    description: "Analyze competitors & market",
    icon: Search,
    href: "/research",
    gradient: "from-cyan-500/20 to-blue-500/20",
    iconColor: "text-cyan-400",
  },
  {
    title: "Build Offer",
    description: "Create your offer blueprint",
    icon: Target,
    href: "/offer",
    gradient: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-400",
  },
  {
    title: "Create Landing Page",
    description: "Generate high-converting page",
    icon: FileText,
    href: "/landing-pages",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400",
  },
  {
    title: "Generate Assets",
    description: "Ad copy, scripts & briefs",
    icon: Palette,
    href: "/assets",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400",
  },
];

export function QuickActions() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <Sparkles className="h-4 w-4 mr-2" />
          AI Assist
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <Link key={action.href} to={action.href}>
            <div className={`group relative overflow-hidden rounded-xl border border-border/50 p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 bg-gradient-to-br ${action.gradient}`}>
              <div className="relative z-10">
                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-background/80 ${action.iconColor} group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <h3 className="font-medium text-foreground mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </div>
              <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="h-5 w-5 text-primary" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
