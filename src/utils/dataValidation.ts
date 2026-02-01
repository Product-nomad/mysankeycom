import type { SankeyLink } from '@/types/sankey';

/**
 * Flow Type Detection - Semantic Mapper
 */
export type FlowType = 'financial' | 'quantity' | 'generic';

export interface FlowTypeResult {
  type: FlowType;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  suggestedUnit: string;
}

// Financial keywords indicate revenue/expense flows
const FINANCIAL_KEYWORDS = [
  'revenue', 'expense', 'cost', 'profit', 'income', 'spend', 'budget',
  'sales', 'earnings', 'payment', 'fee', 'price', 'dollar', 'euro',
  'usd', 'eur', 'gbp', '$', '€', '£', 'margin', 'loss', 'gain',
  'investment', 'roi', 'capital', 'debt', 'credit', 'cash', 'asset'
];

// Quantity keywords indicate unit/inventory flows
const QUANTITY_KEYWORDS = [
  'unit', 'quantity', 'count', 'inventory', 'stock', 'item', 'piece',
  'volume', 'amount', 'ton', 'kg', 'lb', 'liter', 'gallon', 'barrel',
  'mwh', 'gwh', 'kwh', 'watt', 'joule', 'btu', 'energy', 'power',
  'shipment', 'order', 'batch', 'lot', 'package', 'container'
];

/**
 * Detect the semantic flow type based on column names and data values
 */
export const detectFlowType = (
  headers: string[],
  sampleRows: Record<string, string>[],
  valueColumn?: string
): FlowTypeResult => {
  const allText = [
    ...headers.map(h => h.toLowerCase()),
    ...sampleRows.slice(0, 5).flatMap(row => Object.values(row).map(v => v?.toLowerCase() || ''))
  ].join(' ');

  const financialScore = FINANCIAL_KEYWORDS.filter(kw => allText.includes(kw)).length;
  const quantityScore = QUANTITY_KEYWORDS.filter(kw => allText.includes(kw)).length;

  // Check if value column has currency symbols or large decimals
  let hasCurrencyFormat = false;
  let hasWholeNumbers = true;
  
  if (valueColumn && sampleRows.length > 0) {
    for (const row of sampleRows.slice(0, 10)) {
      const value = row[valueColumn] || '';
      if (/[$€£¥]/.test(value) || /\.\d{2}$/.test(value)) {
        hasCurrencyFormat = true;
      }
      if (/\.\d+/.test(value) && !/\.\d{2}$/.test(value)) {
        hasWholeNumbers = false;
      }
    }
  }

  // Determine type with confidence
  if (financialScore > quantityScore + 2 || hasCurrencyFormat) {
    return {
      type: 'financial',
      confidence: financialScore > 3 || hasCurrencyFormat ? 'high' : 'medium',
      reasoning: `Detected financial terms: ${FINANCIAL_KEYWORDS.filter(kw => allText.includes(kw)).slice(0, 3).join(', ')}`,
      suggestedUnit: 'USD'
    };
  }

  if (quantityScore > financialScore + 2 || hasWholeNumbers) {
    return {
      type: 'quantity',
      confidence: quantityScore > 3 ? 'high' : 'medium',
      reasoning: `Detected quantity terms: ${QUANTITY_KEYWORDS.filter(kw => allText.includes(kw)).slice(0, 3).join(', ')}`,
      suggestedUnit: 'Units'
    };
  }

  return {
    type: 'generic',
    confidence: 'low',
    reasoning: 'No clear flow type detected - using generic classification',
    suggestedUnit: 'Value'
  };
};

/**
 * Circular Reference Detection
 */
export interface CircularReference {
  path: string[];
  rowIndices: number[];
  severity: 'error' | 'warning';
}

export interface CircularReferenceResult {
  hasCircular: boolean;
  references: CircularReference[];
  affectedRows: Set<number>;
}

/**
 * Detect circular references in source-target pairs
 * A circular reference is when A -> B -> ... -> A exists
 */
export const detectCircularReferences = (
  rows: Record<string, string>[],
  sourceColumn: string,
  targetColumn: string
): CircularReferenceResult => {
  const references: CircularReference[] = [];
  const affectedRows = new Set<number>();
  
  // Build adjacency list with row indices
  const adjacencyList = new Map<string, { target: string; rowIndex: number }[]>();
  
  rows.forEach((row, index) => {
    const source = row[sourceColumn]?.trim();
    const target = row[targetColumn]?.trim();
    
    if (source && target) {
      if (!adjacencyList.has(source)) {
        adjacencyList.set(source, []);
      }
      adjacencyList.get(source)!.push({ target, rowIndex: index });
    }
  });

  // DFS to find cycles
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const pathStack: { node: string; rowIndex: number }[] = [];

  const dfs = (node: string): void => {
    visited.add(node);
    recursionStack.add(node);

    const neighbors = adjacencyList.get(node) || [];
    for (const { target, rowIndex } of neighbors) {
      pathStack.push({ node: target, rowIndex });

      if (!visited.has(target)) {
        dfs(target);
      } else if (recursionStack.has(target)) {
        // Found a cycle! Trace back the path
        const cycleStartIndex = pathStack.findIndex(p => p.node === target);
        if (cycleStartIndex >= 0) {
          const cyclePath = pathStack.slice(cycleStartIndex).map(p => p.node);
          cyclePath.push(target); // Complete the cycle
          
          const cycleRows = pathStack.slice(cycleStartIndex).map(p => p.rowIndex);
          cycleRows.forEach(r => affectedRows.add(r));

          // Check if it's a direct self-reference (A -> A)
          const isSelfReference = cyclePath.length === 2 && cyclePath[0] === cyclePath[1];
          
          references.push({
            path: cyclePath,
            rowIndices: cycleRows,
            severity: isSelfReference ? 'warning' : 'error'
          });
        }
      }

      pathStack.pop();
    }

    recursionStack.delete(node);
  };

  // Run DFS from all unvisited nodes
  for (const node of adjacencyList.keys()) {
    if (!visited.has(node)) {
      dfs(node);
    }
  }

  return {
    hasCircular: references.length > 0,
    references,
    affectedRows
  };
};

/**
 * Enhanced Data Health Report
 */
export interface DataHealthReport {
  // Basic stats
  totalRows: number;
  validRows: number;
  
  // Issues
  missingValues: { column: string; count: number }[];
  duplicateRows: { key: string; count: number }[];
  circularReferences: CircularReferenceResult;
  
  // Flow type
  flowType: FlowTypeResult;
  
  // Cleaning summary
  errorsFixed: number;
  outliersFound: number;
  
  // Column mapping
  columnMapping: {
    source: string;
    target: string;
    value: string | null;
    unit: string | null;
  };
  
  // Overall health score (0-100)
  healthScore: number;
  isReady: boolean;
}

/**
 * Generate a comprehensive data health report
 */
export const generateHealthReport = (
  rows: Record<string, string>[],
  sourceColumn: string,
  targetColumn: string,
  valueColumn?: string,
  unitColumn?: string
): DataHealthReport => {
  const totalRows = rows.length;
  let validRows = 0;
  let errorsFixed = 0;
  let outliersFound = 0;
  
  // Track missing values
  const missingCount: Record<string, number> = {
    [sourceColumn]: 0,
    [targetColumn]: 0,
  };
  if (valueColumn) missingCount[valueColumn] = 0;
  
  // Track duplicates
  const duplicateTracker = new Map<string, number>();
  
  rows.forEach((row) => {
    const source = row[sourceColumn]?.trim();
    const target = row[targetColumn]?.trim();
    const value = valueColumn ? row[valueColumn]?.trim() : '1';
    
    // Check missing values
    if (!source) missingCount[sourceColumn]++;
    if (!target) missingCount[targetColumn]++;
    if (valueColumn && !value) missingCount[valueColumn]++;
    
    // Check for valid row
    if (source && target) {
      validRows++;
      
      // Track duplicates
      const key = `${source} → ${target}`;
      duplicateTracker.set(key, (duplicateTracker.get(key) || 0) + 1);
      
      // Check for outliers (negative or extremely large values)
      if (valueColumn) {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          if (numValue < 0) {
            outliersFound++;
            errorsFixed++;
          }
        } else {
          errorsFixed++;
        }
      }
    }
  });
  
  // Build missing values array
  const missingValues = Object.entries(missingCount)
    .filter(([, count]) => count > 0)
    .map(([column, count]) => ({ column, count }));
  
  // Build duplicates array (only rows with duplicates)
  const duplicateRows = Array.from(duplicateTracker.entries())
    .filter(([, count]) => count > 1)
    .map(([key, count]) => ({ key, count }));
  
  // Detect circular references
  const circularReferences = detectCircularReferences(rows, sourceColumn, targetColumn);
  
  // Detect flow type
  const flowType = detectFlowType(
    Object.keys(rows[0] || {}),
    rows,
    valueColumn
  );
  
  // Calculate health score
  let healthScore = 100;
  
  // Deduct for missing values
  const totalMissing = missingValues.reduce((sum, m) => sum + m.count, 0);
  healthScore -= Math.min(30, (totalMissing / totalRows) * 100);
  
  // Deduct for circular references
  if (circularReferences.hasCircular) {
    healthScore -= circularReferences.references.filter(r => r.severity === 'error').length * 10;
    healthScore -= circularReferences.references.filter(r => r.severity === 'warning').length * 5;
  }
  
  // Deduct for high duplicate ratio
  const duplicateRatio = duplicateRows.reduce((sum, d) => sum + d.count - 1, 0) / totalRows;
  if (duplicateRatio > 0.5) healthScore -= 10;
  
  healthScore = Math.max(0, Math.round(healthScore));
  
  return {
    totalRows,
    validRows,
    missingValues,
    duplicateRows,
    circularReferences,
    flowType,
    errorsFixed,
    outliersFound,
    columnMapping: {
      source: sourceColumn,
      target: targetColumn,
      value: valueColumn || null,
      unit: unitColumn || null
    },
    healthScore,
    isReady: healthScore >= 50 && !circularReferences.references.some(r => r.severity === 'error')
  };
};
