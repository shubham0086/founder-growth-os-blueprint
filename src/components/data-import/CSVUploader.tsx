import { useState, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CSVUploaderProps {
  onDataParsed: (data: Record<string, string>[]) => void;
  expectedColumns: string[];
  sampleRow?: Record<string, string>;
  className?: string;
}

export function CSVUploader({ 
  onDataParsed, 
  expectedColumns, 
  sampleRow,
  className 
}: CSVUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, string>[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseFile = useCallback((file: File) => {
    setError(null);
    setFile(file);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`Parse error: ${results.errors[0].message}`);
          return;
        }

        const headers = results.meta.fields || [];
        const missingColumns = expectedColumns.filter(
          col => !headers.some(h => h.toLowerCase() === col.toLowerCase())
        );

        if (missingColumns.length > 0) {
          setError(`Missing columns: ${missingColumns.join(', ')}`);
          return;
        }

        // Normalize column names to lowercase
        const normalizedData = results.data.map(row => {
          const normalized: Record<string, string> = {};
          Object.entries(row).forEach(([key, value]) => {
            normalized[key.toLowerCase()] = value;
          });
          return normalized;
        });

        setParsedData(normalizedData);
      },
      error: (error) => {
        setError(`Failed to parse file: ${error.message}`);
      }
    });
  }, [expectedColumns]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      parseFile(droppedFile);
    } else {
      setError('Please upload a CSV file');
    }
  }, [parseFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      parseFile(selectedFile);
    }
  }, [parseFile]);

  const handleConfirm = () => {
    if (parsedData) {
      onDataParsed(parsedData);
    }
  };

  const handleReset = () => {
    setFile(null);
    setError(null);
    setParsedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
          isDragOver 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-primary/50",
          file && !error && "border-success bg-success/5"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {!file ? (
          <>
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-foreground font-medium mb-1">
              Drop your CSV file here or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Required columns: {expectedColumns.join(', ')}
            </p>
          </>
        ) : error ? (
          <>
            <AlertCircle className="h-10 w-10 mx-auto text-destructive mb-3" />
            <p className="text-destructive font-medium mb-1">{error}</p>
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleReset(); }}>
              Try Again
            </Button>
          </>
        ) : (
          <>
            <FileText className="h-10 w-10 mx-auto text-success mb-3" />
            <p className="text-foreground font-medium mb-1">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {parsedData?.length} rows ready to import
            </p>
          </>
        )}
      </div>

      {/* Sample Format */}
      {sampleRow && !parsedData && (
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm font-medium text-foreground mb-2">Sample CSV format:</p>
          <code className="text-xs text-muted-foreground block overflow-x-auto">
            {expectedColumns.join(',')}<br/>
            {Object.values(sampleRow).join(',')}
          </code>
        </div>
      )}

      {/* Preview */}
      {parsedData && parsedData.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Preview ({parsedData.length} rows)
            </p>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="overflow-x-auto max-h-48">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {expectedColumns.map(col => (
                    <th key={col} className="text-left py-2 px-2 text-muted-foreground font-medium">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedData.slice(0, 5).map((row, idx) => (
                  <tr key={idx} className="border-b border-border/50">
                    {expectedColumns.map(col => (
                      <td key={col} className="py-2 px-2 text-foreground">
                        {row[col.toLowerCase()] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedData.length > 5 && (
              <p className="text-xs text-muted-foreground mt-2">
                ... and {parsedData.length - 5} more rows
              </p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {parsedData && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleReset}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="gap-2 gradient-primary text-primary-foreground">
            <Upload className="h-4 w-4" />
            Import {parsedData.length} Rows
          </Button>
        </div>
      )}
    </div>
  );
}
