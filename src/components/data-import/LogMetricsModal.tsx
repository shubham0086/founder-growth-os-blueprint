import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/safeClient';
import { useWorkspace } from '@/hooks/useWorkspace';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import { format } from 'date-fns';

interface LogMetricsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LogMetricsModal({ open, onOpenChange, onSuccess }: LogMetricsModalProps) {
  const { workspace } = useWorkspace();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    spend: '',
    clicks: '',
    leads: '',
    bookings: '',
    revenue: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workspace?.id) {
      toast.error('No workspace selected');
      return;
    }

    setSaving(true);

    try {
      const spend = parseFloat(formData.spend) || 0;
      const leads = parseInt(formData.leads) || 0;
      const cpl = leads > 0 ? spend / leads : 0;

      const { error } = await supabase
        .from('metrics_daily')
        .upsert({
          workspace_id: workspace.id,
          date: formData.date,
          spend,
          clicks: parseInt(formData.clicks) || 0,
          leads,
          bookings: parseInt(formData.bookings) || 0,
          revenue: parseFloat(formData.revenue) || null,
          cpl,
          notes: formData.notes || null,
        }, {
          onConflict: 'workspace_id,date',
        });

      if (error) throw error;

      toast.success('Daily metrics saved');
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        spend: '',
        clicks: '',
        leads: '',
        bookings: '',
        revenue: '',
        notes: '',
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving metrics:', error);
      toast.error('Failed to save metrics');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log Daily Metrics</DialogTitle>
          <DialogDescription>
            Enter your campaign performance for a specific day.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="spend">Ad Spend (₹)</Label>
              <Input
                id="spend"
                type="number"
                min="0"
                step="0.01"
                value={formData.spend}
                onChange={(e) => setFormData(prev => ({ ...prev, spend: e.target.value }))}
                placeholder="5000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clicks">Clicks</Label>
              <Input
                id="clicks"
                type="number"
                min="0"
                value={formData.clicks}
                onChange={(e) => setFormData(prev => ({ ...prev, clicks: e.target.value }))}
                placeholder="150"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="leads">Leads</Label>
              <Input
                id="leads"
                type="number"
                min="0"
                value={formData.leads}
                onChange={(e) => setFormData(prev => ({ ...prev, leads: e.target.value }))}
                placeholder="8"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bookings">Bookings</Label>
              <Input
                id="bookings"
                type="number"
                min="0"
                value={formData.bookings}
                onChange={(e) => setFormData(prev => ({ ...prev, bookings: e.target.value }))}
                placeholder="2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="revenue">Revenue (₹) - Optional</Label>
            <Input
              id="revenue"
              type="number"
              min="0"
              step="0.01"
              value={formData.revenue}
              onChange={(e) => setFormData(prev => ({ ...prev, revenue: e.target.value }))}
              placeholder="50000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes - Optional</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Campaign updates, observations..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="gap-2 gradient-primary text-primary-foreground">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Metrics
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
