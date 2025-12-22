import { StatusBadge } from "@/components/ui/status-badge";
import { Clock } from "lucide-react";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { Skeleton } from "@/components/ui/skeleton";

export function RecentActivity() {
  const { activities, loading, error } = useRecentActivity();

  if (error) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Failed to load recent activity.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        <button className="text-sm text-muted-foreground hover:text-primary transition-colors">
          View all
        </button>
      </div>
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-start gap-4 rounded-xl border border-border/50 bg-card/50 p-4"
            >
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32 mt-2" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent activity yet.</p>
            <p className="text-sm mt-1">Start adding leads, assets, or experiments to see activity here.</p>
          </div>
        ) : (
          activities.map((activity, index) => (
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
          ))
        )}
      </div>
    </div>
  );
}
