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

interface ImportLeadsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const EXPECTED_COLUMNS = ['name', 'email', 'phone', 'source', 'stage'];
const SAMPLE_ROW = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+91 98765 43210',
  source: 'Google Ads',
  stage: 'new',
};

export function ImportLeadsModal({ open, onOpenChange, onSuccess }: ImportLeadsModalProps) {
  const { workspace } = useWorkspace();
  const [importing, setImporting] = useState(false);

  const handleImport = async (data: Record<string, string>[]) => {
    if (!workspace?.id) {
      toast.error('No workspace selected');
      return;
    }

    setImporting(true);

    try {
      const leadsToInsert = data.map(row => ({
        workspace_id: workspace.id,
        name: row.name || 'Unknown',
        email: row.email || null,
        phone: row.phone || null,
        source: row.source || null,
        stage: row.stage?.toLowerCase() || 'new',
        score: 0,
      }));

      const { error } = await supabase
        .from('leads')
        .insert(leadsToInsert);

      if (error) throw error;

      toast.success(`Successfully imported ${data.length} leads`);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import leads. Please check your data and try again.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Leads from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with your leads data. The file should contain columns for name, email, phone, source, and stage.
          </DialogDescription>
        </DialogHeader>

        {importing ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Importing leads...</p>
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
