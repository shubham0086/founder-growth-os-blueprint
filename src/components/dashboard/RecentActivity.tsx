import { StatusBadge } from "@/components/ui/status-badge";
import { 
  User, 
  FileText, 
  TrendingUp, 
  Mail,
  Clock 
} from "lucide-react";

const activities = [
  {
    id: 1,
    type: "lead",
    title: "New lead from Google Ads",
    description: "Priya Sharma submitted contact form",
    time: "2 mins ago",
    icon: User,
    status: "success" as const,
  },
  {
    id: 2,
    type: "content",
    title: "Landing page published",
    description: "fitness-transformation.com is now live",
    time: "1 hour ago",
    icon: FileText,
    status: "info" as const,
  },
  {
    id: 3,
    type: "experiment",
    title: "Experiment completed",
    description: "Headline A/B test: +23% conversion",
    time: "3 hours ago",
    icon: TrendingUp,
    status: "success" as const,
  },
  {
    id: 4,
    type: "automation",
    title: "Follow-up sent",
    description: "24h nurture email to 5 leads",
    time: "5 hours ago",
    icon: Mail,
    status: "neutral" as const,
  },
];

export function RecentActivity() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        <button className="text-sm text-muted-foreground hover:text-primary transition-colors">
          View all
        </button>
      </div>
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className="group flex items-start gap-4 rounded-xl border border-border/50 bg-card/50 p-4 transition-all duration-200 hover:bg-card hover:border-border animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <activity.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-foreground text-sm truncate">
                  {activity.title}
                </h3>
                <StatusBadge status={activity.status} label={activity.type} />
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {activity.description}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Clock className="h-3 w-3" />
              {activity.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
