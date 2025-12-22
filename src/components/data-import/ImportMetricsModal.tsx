import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CSVUploader } from './CSVUploader';
import { supabase } from '@/integrations/supabase/safeClient';
import { useWorkspace } from '@/hooks/useWorkspace';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ImportMetricsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const EXPECTED_COLUMNS = ['date', 'spend', 'clicks', 'leads', 'bookings'];
const SAMPLE_ROW = {
  date: '2024-12-20',
  spend: '5000',
  clicks: '150',
  leads: '8',
  bookings: '2',
};

export function ImportMetricsModal({ open, onOpenChange, onSuccess }: ImportMetricsModalProps) {
  const { workspace } = useWorkspace();
  const [importing, setImporting] = useState(false);

  const handleImport = async (data: Record<string, string>[]) => {
    if (!workspace?.id) {
      toast.error('No workspace selected');
      return;
    }

    setImporting(true);

    try {
      const metricsToInsert = data.map(row => ({
        workspace_id: workspace.id,
        date: row.date,
        spend: parseFloat(row.spend) || 0,
        clicks: parseInt(row.clicks) || 0,
        leads: parseInt(row.leads) || 0,
        bookings: parseInt(row.bookings) || 0,
        cpl: (parseFloat(row.spend) || 0) / Math.max(parseInt(row.leads) || 1, 1),
      }));

      const { error } = await supabase
        .from('metrics_daily')
        .upsert(metricsToInsert, { 
          onConflict: 'workspace_id,date',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      toast.success(`Successfully imported ${data.length} days of metrics`);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import metrics. Please check your data and try again.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Daily Metrics from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with your campaign metrics. Each row should represent one day's performance data.
          </DialogDescription>
        </DialogHeader>

        {importing ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Importing metrics...</p>
          </div>
        ) : (
          <CSVUploader
            expectedColumns={EXPECTED_COLUMNS}
            sampleRow={SAMPLE_ROW}
            onDataParsed={handleImport}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
