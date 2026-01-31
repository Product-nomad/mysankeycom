import { useState, useCallback, useRef, DragEvent } from 'react';
import Papa from 'papaparse';
import { 
  Upload, FileSpreadsheet, Download, X, Check, AlertCircle, 
  Sparkles, Loader2, Wand2, CheckCircle2, XCircle, AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import type { SankeyData } from '@/types/sankey';
import { cn } from '@/lib/utils';

interface DataUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReady: (data: SankeyData) => void;
}

interface ParsedRow {
  [key: string]: string;
}

interface AIMapping {
  sourceColumn: string | null;
  targetColumn: string | null;
  valueColumn: string | null;
  useFrequencyCount: boolean;
  confidence: 'high' | 'medium' | 'low';
  explanation: string;
}

interface CleaningResult {
  originalRows: number;
  cleanedRows: number;
  errorsFixed: number;
  duplicatesMerged: number;
  outliersFlagged: number;
  issues: string[];
}

interface HealthCheck {
  totalRows: number;
  validRows: number;
  errorsFixed: number;
  outliers: number;
  duplicatesMerged: number;
  ready: boolean;
}

type Step = 'upload' | 'mapping' | 'cleaning' | 'validation';

const DataUpload = ({ isOpen, onClose, onDataReady }: DataUploadProps) => {
  const [step, setStep] = useState<Step>('upload');
  const [parsedData, setParsedData] = useState<ParsedRow[] | null>(null);
  const [cleanedData, setCleanedData] = useState<ParsedRow[] | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [sourceColumn, setSourceColumn] = useState<string>('');
  const [targetColumn, setTargetColumn] = useState<string>('');
  const [valueColumn, setValueColumn] = useState<string>('');
  const [unitColumn, setUnitColumn] = useState<string>('');
  const [useFrequencyCount, setUseFrequencyCount] = useState(false);
  const [error, setError] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiMapping, setAiMapping] = useState<AIMapping | null>(null);
  const [healthCheck, setHealthCheck] = useState<HealthCheck | null>(null);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setStep('upload');
    setParsedData(null);
    setCleanedData(null);
    setColumns([]);
    setSourceColumn('');
    setTargetColumn('');
    setValueColumn('');
    setUnitColumn('');
    setUseFrequencyCount(false);
    setError('');
    setFileName('');
    setAiMapping(null);
    setHealthCheck(null);
    setIsAnalyzing(false);
    setIsCleaning(false);
  }, []);

  const analyzeSchema = useCallback(async (headers: string[], sampleRows: ParsedRow[]) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-data-schema', {
        body: { headers, sampleRows: sampleRows.slice(0, 3) }
      });

      if (error) throw error;

      if (data && !data.error) {
        setAiMapping(data as AIMapping);
        
        if (data.sourceColumn && headers.includes(data.sourceColumn)) {
          setSourceColumn(data.sourceColumn);
        }
        if (data.targetColumn && headers.includes(data.targetColumn)) {
          setTargetColumn(data.targetColumn);
        }
        if (data.valueColumn && headers.includes(data.valueColumn)) {
          setValueColumn(data.valueColumn);
        }
        if (data.useFrequencyCount) {
          setUseFrequencyCount(true);
        }
      }
    } catch (err) {
      console.error('Schema analysis failed:', err);
      // Continue without AI suggestions
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const processFile = useCallback((file: File) => {
    setError('');
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
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
        setStep('mapping');

        // Check if data is already in Sankey format
        const lowerCols = cols.map(c => c.toLowerCase());
        const hasSource = lowerCols.some(c => c.includes('source') || c.includes('from'));
        const hasTarget = lowerCols.some(c => c.includes('target') || c.includes('to') || c.includes('dest'));
        const hasValue = lowerCols.some(c => c.includes('value') || c.includes('amount') || c.includes('flow') || c.includes('quantity'));

        if (!hasSource || !hasTarget) {
          // Trigger AI Mapper for non-standard data
          await analyzeSchema(cols, data);
        } else {
          // Auto-detect standard columns
          const sourceIdx = lowerCols.findIndex(c => c.includes('source') || c.includes('from'));
          const targetIdx = lowerCols.findIndex(c => c.includes('target') || c.includes('to') || c.includes('dest'));
          const valueIdx = lowerCols.findIndex(c => c.includes('value') || c.includes('amount') || c.includes('flow'));
          const unitIdx = lowerCols.findIndex(c => c.includes('unit'));

          if (sourceIdx >= 0) setSourceColumn(cols[sourceIdx]);
          if (targetIdx >= 0) setTargetColumn(cols[targetIdx]);
          if (valueIdx >= 0) setValueColumn(cols[valueIdx]);
          if (unitIdx >= 0) setUnitColumn(cols[unitIdx]);
        }
      },
      error: (err) => {
        setError(`Failed to parse file: ${err.message}`);
      },
    });
  }, [analyzeSchema]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      const validTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      const validExtensions = ['.csv', '.xlsx', '.xls'];
      const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      
      if (validTypes.includes(file.type) || hasValidExtension) {
        processFile(file);
      } else {
        setError('Please upload a CSV or Excel file');
      }
    }
  }, [processFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const cleanData = useCallback(() => {
    if (!parsedData || !sourceColumn || !targetColumn) return;

    setIsCleaning(true);
    
    setTimeout(() => {
      let errorsFixed = 0;
      let outliers: string[] = [];
      const aggregated = new Map<string, { value: number; count: number }>();
      
      const processed = parsedData.map(row => {
        const cleaned = { ...row };
        
        // Trim whitespace and fix casing
        if (cleaned[sourceColumn]) {
          const original = cleaned[sourceColumn];
          cleaned[sourceColumn] = cleaned[sourceColumn].trim();
          // Capitalize first letter of each word
          cleaned[sourceColumn] = cleaned[sourceColumn]
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
          if (original !== cleaned[sourceColumn]) errorsFixed++;
        }
        
        if (cleaned[targetColumn]) {
          const original = cleaned[targetColumn];
          cleaned[targetColumn] = cleaned[targetColumn].trim();
          cleaned[targetColumn] = cleaned[targetColumn]
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
          if (original !== cleaned[targetColumn]) errorsFixed++;
        }

        // Check value column for issues
        if (valueColumn && cleaned[valueColumn]) {
          const value = parseFloat(cleaned[valueColumn]);
          if (isNaN(value)) {
            // Non-numeric value
            cleaned[valueColumn] = '0';
            errorsFixed++;
          } else if (value < 0) {
            // Negative value - flag as outlier and make absolute
            outliers.push(`Negative value (${value}) in row: ${cleaned[sourceColumn]} → ${cleaned[targetColumn]}`);
            cleaned[valueColumn] = Math.abs(value).toString();
            errorsFixed++;
          }
        }

        return cleaned;
      });

      // Deduplicate by aggregating values
      let duplicatesMerged = 0;
      processed.forEach(row => {
        const source = row[sourceColumn];
        const target = row[targetColumn];
        const key = `${source}||${target}`;
        
        let value = 1; // default for frequency count
        if (valueColumn && row[valueColumn]) {
          value = parseFloat(row[valueColumn]) || 0;
        }

        if (aggregated.has(key)) {
          const existing = aggregated.get(key)!;
          existing.value += value;
          existing.count++;
          duplicatesMerged++;
        } else {
          aggregated.set(key, { value, count: 1 });
        }
      });

      // Convert back to rows
      const finalData: ParsedRow[] = [];
      aggregated.forEach((data, key) => {
        const [source, target] = key.split('||');
        finalData.push({
          [sourceColumn]: source,
          [targetColumn]: target,
          [valueColumn || '_value']: data.value.toString(),
          ...(unitColumn ? { [unitColumn]: parsedData[0]?.[unitColumn] || '' } : {})
        });
      });

      setCleanedData(finalData);
      setHealthCheck({
        totalRows: parsedData.length,
        validRows: finalData.length,
        errorsFixed,
        outliers: outliers.length,
        duplicatesMerged,
        ready: true
      });
      setStep('validation');
      setIsCleaning(false);
    }, 500);
  }, [parsedData, sourceColumn, targetColumn, valueColumn, unitColumn]);

  const handleConfirmMapping = useCallback(() => {
    if (!sourceColumn || !targetColumn) {
      setError('Please select Source and Target columns');
      return;
    }
    if (!valueColumn && !useFrequencyCount) {
      setError('Please select a Value column or enable frequency counting');
      return;
    }
    setError('');
    setStep('cleaning');
  }, [sourceColumn, targetColumn, valueColumn, useFrequencyCount]);

  const handleFinalize = useCallback(() => {
    const dataToProcess = cleanedData || parsedData;
    if (!dataToProcess || !sourceColumn || !targetColumn) return;

    try {
      const nodesSet = new Set<string>();
      const linksMap = new Map<string, number>();
      let unit = '';

      dataToProcess.forEach((row) => {
        const source = row[sourceColumn]?.trim();
        const target = row[targetColumn]?.trim();
        let value = 1;
        
        if (valueColumn || useFrequencyCount) {
          value = valueColumn ? parseFloat(row[valueColumn]) || 1 : 1;
        }

        if (source && target && value > 0) {
          nodesSet.add(source);
          nodesSet.add(target);
          
          const key = `${source}||${target}`;
          linksMap.set(key, (linksMap.get(key) || 0) + value);
        }

        if (unitColumn && row[unitColumn] && !unit) {
          unit = row[unitColumn].trim();
        }
      });

      const links = Array.from(linksMap.entries()).map(([key, value]) => {
        const [source, target] = key.split('||');
        return { source, target, value };
      });

      if (links.length === 0) {
        setError('No valid links found');
        return;
      }

      const sankeyData: SankeyData = {
        nodes: Array.from(nodesSet).map(name => ({ name })),
        links,
        unit: unit || (useFrequencyCount ? 'Count' : undefined),
        sources: [{ name: `Uploaded: ${fileName}`, url: null, type: 'official' as const }],
      };

      onDataReady(sankeyData);
      resetState();
      onClose();
    } catch (err) {
      setError('Failed to process data');
    }
  }, [cleanedData, parsedData, sourceColumn, targetColumn, valueColumn, unitColumn, useFrequencyCount, fileName, onDataReady, onClose, resetState]);

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

  const confidenceColor = (conf: string) => {
    switch (conf) {
      case 'high': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-muted';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg glass-strong">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Data Import & Cleaning
            {step !== 'upload' && (
              <Badge variant="outline" className="ml-2 text-xs">
                Step {step === 'mapping' ? '1' : step === 'cleaning' ? '2' : '3'} of 3
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                  isDragActive 
                    ? "border-primary bg-primary/5 scale-[1.02]" 
                    : "border-border/50 hover:border-primary/50"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className={cn(
                  "h-10 w-10 mx-auto mb-3 transition-colors",
                  isDragActive ? "text-primary" : "text-muted-foreground"
                )} />
                {isDragActive ? (
                  <p className="text-sm font-medium text-primary">Drop your file here...</p>
                ) : (
                  <>
                    <p className="text-sm font-medium">Drag & drop your CSV/Excel file</p>
                    <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>

              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}
            </>
          )}

          {/* Step 2: Mapping */}
          {step === 'mapping' && parsedData && (
            <>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium truncate max-w-[200px]">{fileName}</span>
                  <Badge variant="secondary" className="text-xs">
                    {parsedData.length} rows
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={resetState}>
                  <X className="h-3 w-3" />
                </Button>
              </div>

              {/* AI Suggestion */}
              {isAnalyzing && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm">AI is analyzing your data schema...</span>
                </div>
              )}

              {aiMapping && !isAnalyzing && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">AI Mapping Suggestion</span>
                    <Badge className={cn("text-xs", confidenceColor(aiMapping.confidence))}>
                      {aiMapping.confidence} confidence
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{aiMapping.explanation}</p>
                  {aiMapping.useFrequencyCount && (
                    <p className="text-xs text-yellow-400">
                      ⚡ No value column detected - using frequency counting
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  Column Mapping
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Source (From) *</Label>
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
                    <Label className="text-xs">Target (To) *</Label>
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
                    <Label className="text-xs">Value {useFrequencyCount ? '(auto)' : '*'}</Label>
                    <Select 
                      value={valueColumn} 
                      onValueChange={setValueColumn}
                      disabled={useFrequencyCount}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder={useFrequencyCount ? "Using count" : "Select column"} />
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

                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useFrequencyCount}
                    onChange={(e) => {
                      setUseFrequencyCount(e.target.checked);
                      if (e.target.checked) setValueColumn('');
                    }}
                    className="rounded border-border"
                  />
                  <span>Use frequency counting (no value column needed)</span>
                </label>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Preview</h4>
                <ScrollArea className="h-24 rounded-lg border border-border/50">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="p-1.5 text-left">Source</th>
                        <th className="p-1.5 text-left">Target</th>
                        <th className="p-1.5 text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.slice(0, 3).map((row, i) => (
                        <tr key={i} className="border-t border-border/30">
                          <td className="p-1.5">{sourceColumn ? row[sourceColumn] : '-'}</td>
                          <td className="p-1.5">{targetColumn ? row[targetColumn] : '-'}</td>
                          <td className="p-1.5 text-right">
                            {valueColumn ? row[valueColumn] : (useFrequencyCount ? '1' : '-')}
                          </td>
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
                <Button variant="outline" className="flex-1" onClick={resetState}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleConfirmMapping}
                  disabled={!sourceColumn || !targetColumn || (!valueColumn && !useFrequencyCount)}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Confirm Mapping
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Cleaning */}
          {step === 'cleaning' && parsedData && (
            <>
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Data Cleaning Options
                </h4>
                
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-400" />
                    Trim whitespace & fix inconsistent casing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-400" />
                    Detect and fix negative values
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-400" />
                    Flag non-numeric values in Value column
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-400" />
                    Merge duplicate Source→Target pairs
                  </li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep('mapping')}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={cleanData}
                  disabled={isCleaning}
                >
                  {isCleaning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cleaning...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Clean My Data
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Step 4: Validation */}
          {step === 'validation' && healthCheck && (
            <>
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  Health Check Summary
                </h4>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded bg-green-500/10 border border-green-500/20">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span>{healthCheck.validRows} Rows Processed</span>
                  </div>
                  
                  {healthCheck.errorsFixed > 0 && (
                    <div className="flex items-center gap-2 p-2 rounded bg-blue-500/10 border border-blue-500/20">
                      <XCircle className="h-4 w-4 text-blue-400" />
                      <span>{healthCheck.errorsFixed} Errors Fixed</span>
                    </div>
                  )}
                  
                  {healthCheck.duplicatesMerged > 0 && (
                    <div className="flex items-center gap-2 p-2 rounded bg-purple-500/10 border border-purple-500/20">
                      <RefreshCw className="h-4 w-4 text-purple-400" />
                      <span>{healthCheck.duplicatesMerged} Duplicates Merged</span>
                    </div>
                  )}
                  
                  {healthCheck.outliers > 0 && (
                    <div className="flex items-center gap-2 p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      <span>{healthCheck.outliers} Outliers Flagged</span>
                    </div>
                  )}
                </div>

                {healthCheck.totalRows !== healthCheck.validRows && (
                  <p className="text-xs text-muted-foreground">
                    Original: {healthCheck.totalRows} rows → Cleaned: {healthCheck.validRows} rows
                  </p>
                )}
              </div>

              {/* Preview cleaned data */}
              {cleanedData && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Cleaned Data Preview</h4>
                  <ScrollArea className="h-24 rounded-lg border border-border/50">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>
                          <th className="p-1.5 text-left">Source</th>
                          <th className="p-1.5 text-left">Target</th>
                          <th className="p-1.5 text-right">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cleanedData.slice(0, 5).map((row, i) => (
                          <tr key={i} className="border-t border-border/30">
                            <td className="p-1.5">{row[sourceColumn]}</td>
                            <td className="p-1.5">{row[targetColumn]}</td>
                            <td className="p-1.5 text-right">{row[valueColumn || '_value']}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep('cleaning')}>
                  Back
                </Button>
                <Button
                  className="flex-1 gradient-neon text-primary-foreground"
                  onClick={handleFinalize}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Finalize & Visualize
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
