import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/safeClient';
import { useWorkspace, Workspace } from './useWorkspace';
import { toast } from 'sonner';

export interface NotificationSettings {
  newLeadAlerts: boolean;
  dailyBrief: boolean;
  experimentResults: boolean;
  budgetWarnings: boolean;
}

export function useSettings() {
  const { workspace, refreshWorkspaces } = useWorkspace();
  const [notifications, setNotifications] = useState<NotificationSettings>({
    newLeadAlerts: true,
    dailyBrief: true,
    experimentResults: true,
    budgetWarnings: true,
  });
  const [saving, setSaving] = useState(false);

  // Load notifications from localStorage (or could be stored in DB)
  useEffect(() => {
    if (workspace?.id) {
      const saved = localStorage.getItem(`notifications_${workspace.id}`);
      if (saved) {
        try {
          setNotifications(JSON.parse(saved));
        } catch {
          // Use defaults
        }
      }
    }
  }, [workspace?.id]);

  const updateWorkspace = async (updates: Partial<Workspace>) => {
    if (!workspace?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('workspaces')
        .update({
          name: updates.name,
          industry: updates.industry,
          region: updates.region,
          currency: updates.currency,
          timezone: updates.timezone,
        })
        .eq('id', workspace.id);

      if (error) throw error;

      toast.success('Workspace settings saved');
      await refreshWorkspaces();
    } catch (err) {
      console.error('Error updating workspace:', err);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateNotification = (key: keyof NotificationSettings, value: boolean) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    if (workspace?.id) {
      localStorage.setItem(`notifications_${workspace.id}`, JSON.stringify(updated));
    }
    toast.success('Notification preference updated');
  };

  return {
    workspace,
    notifications,
    saving,
    updateWorkspace,
    updateNotification,
  };
}
