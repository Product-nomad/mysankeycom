import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { Upload, FileSpreadsheet, Download, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { SankeyData } from '@/types/sankey';

interface DataUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReady: (data: SankeyData) => void;
}

interface ParsedRow {
  [key: string]: string;
}

const DataUpload = ({ isOpen, onClose, onDataReady }: DataUploadProps) => {
  const [parsedData, setParsedData] = useState<ParsedRow[] | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [sourceColumn, setSourceColumn] = useState<string>('');
  const [targetColumn, setTargetColumn] = useState<string>('');
  const [valueColumn, setValueColumn] = useState<string>('');
  const [unitColumn, setUnitColumn] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  const resetState = useCallback(() => {
    setParsedData(null);
    setColumns([]);
    setSourceColumn('');
    setTargetColumn('');
    setValueColumn('');
    setUnitColumn('');
    setError('');
    setFileName('');
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`Parse error: ${results.errors[0].message}`);
          return;
        }

        const data = results.data as ParsedRow[];
        if (data.length === 0) {
          setError('No data found in file');
          return;
        }

        const cols = Object.keys(data[0]);
        setColumns(cols);
        setParsedData(data);

        // Auto-detect columns
        const lowerCols = cols.map(c => c.toLowerCase());
        const sourceIdx = lowerCols.findIndex(c => c.includes('source') || c.includes('from'));
        const targetIdx = lowerCols.findIndex(c => c.includes('target') || c.includes('to') || c.includes('dest'));
        const valueIdx = lowerCols.findIndex(c => c.includes('value') || c.includes('amount') || c.includes('flow'));
        const unitIdx = lowerCols.findIndex(c => c.includes('unit'));

        if (sourceIdx >= 0) setSourceColumn(cols[sourceIdx]);
        if (targetIdx >= 0) setTargetColumn(cols[targetIdx]);
        if (valueIdx >= 0) setValueColumn(cols[valueIdx]);
        if (unitIdx >= 0) setUnitColumn(cols[unitIdx]);
      },
      error: (err) => {
        setError(`Failed to parse file: ${err.message}`);
      },
    });
  }, []);

  const handleImport = useCallback(() => {
    if (!parsedData || !sourceColumn || !targetColumn || !valueColumn) {
      setError('Please map all required columns');
      return;
    }

    try {
      const nodesSet = new Set<string>();
      const links: { source: string; target: string; value: number }[] = [];
      let unit = '';

      parsedData.forEach((row) => {
        const source = row[sourceColumn]?.trim();
        const target = row[targetColumn]?.trim();
        const value = parseFloat(row[valueColumn]);

        if (source && target && !isNaN(value) && value > 0) {
          nodesSet.add(source);
          nodesSet.add(target);
          links.push({ source, target, value });
        }

        if (unitColumn && row[unitColumn] && !unit) {
          unit = row[unitColumn].trim();
        }
      });

      if (links.length === 0) {
        setError('No valid links found. Ensure source, target, and value columns have valid data.');
        return;
      }

      const sankeyData: SankeyData = {
        nodes: Array.from(nodesSet).map(name => ({ name })),
        links,
        unit: unit || undefined,
        sources: [{ name: 'Uploaded CSV', url: null, type: 'official' as const }],
      };

      onDataReady(sankeyData);
      resetState();
      onClose();
    } catch (err) {
      setError('Failed to process data');
    }
  }, [parsedData, sourceColumn, targetColumn, valueColumn, unitColumn, onDataReady, onClose, resetState]);

  const downloadTemplate = useCallback(() => {
    const template = 'Source,Target,Value,Unit\nCategory A,Category B,100,Units\nCategory B,Category C,60,Units\nCategory B,Category D,40,Units';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sankey_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg glass-strong">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Import Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!parsedData ? (
            <>
              <div
                className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium">Drop CSV/Excel file or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">Supports .csv, .xlsx, .xls</p>
              </div>

              <Button variant="outline" className="w-full" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium truncate max-w-[200px]">{fileName}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={resetState}>
                  <X className="h-3 w-3" />
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                Found {parsedData.length} rows and {columns.length} columns
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Map Columns</h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Source *</Label>
                    <Select value={sourceColumn} onValueChange={setSourceColumn}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map((col) => (
                          <SelectItem key={col} value={col} className="text-xs">
                            {col}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Target *</Label>
                    <Select value={targetColumn} onValueChange={setTargetColumn}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map((col) => (
                          <SelectItem key={col} value={col} className="text-xs">
                            {col}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Value *</Label>
                    <Select value={valueColumn} onValueChange={setValueColumn}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map((col) => (
                          <SelectItem key={col} value={col} className="text-xs">
                            {col}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Unit (optional)</Label>
                    <Select value={unitColumn} onValueChange={setUnitColumn}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map((col) => (
                          <SelectItem key={col} value={col} className="text-xs">
                            {col}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Preview</h4>
                <ScrollArea className="h-32 rounded-lg border border-border/50">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="p-1.5 text-left">Source</th>
                        <th className="p-1.5 text-left">Target</th>
                        <th className="p-1.5 text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-t border-border/30">
                          <td className="p-1.5">{sourceColumn ? row[sourceColumn] : '-'}</td>
                          <td className="p-1.5">{targetColumn ? row[targetColumn] : '-'}</td>
                          <td className="p-1.5 text-right">{valueColumn ? row[valueColumn] : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </div>

              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 gradient-neon text-primary-foreground"
                  onClick={handleImport}
                  disabled={!sourceColumn || !targetColumn || !valueColumn}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DataUpload;
