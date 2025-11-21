import { InventoryItem } from '../types';
import { COLUMN_MAPPING } from '../constants';

const parseCSVLine = (line: string): string[] => {
  const result = [];
  let startValueIndex = 0;
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      inQuotes = !inQuotes;
    } else if (line[i] === ',' && !inQuotes) {
      let val = line.substring(startValueIndex, i).trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      result.push(val);
      startValueIndex = i + 1;
    }
  }
  let lastVal = line.substring(startValueIndex).trim();
  if (lastVal.startsWith('"') && lastVal.endsWith('"')) {
    lastVal = lastVal.slice(1, -1);
  }
  result.push(lastVal);
  return result;
};

export const convertToCsvUrl = (url: string): string | null => {
  if (!url) return null;
  try {
    // Handle standard Google Sheet URLs
    // Format: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit...
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
    }
    // If already a CSV link or other format, return as is (validation might fail later if invalid)
    if (url.endsWith('.csv') || url.includes('output=csv') || url.includes('format=csv')) {
      return url;
    }
    return null;
  } catch (e) {
    console.error("Error parsing URL", e);
    return null;
  }
};

export const fetchInventoryData = async (sheetUrl: string): Promise<InventoryItem[]> => {
  const csvUrl = convertToCsvUrl(sheetUrl);
  if (!csvUrl) {
    throw new Error("Invalid Google Sheet URL. Please ensure it is a public link.");
  }

  try {
    const response = await fetch(csvUrl);
    if (!response.ok) throw new Error("Failed to fetch data from Google Sheets.");
    
    const text = await response.text();
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length < 2) return []; // Header + at least one row

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
    
    // Map CSV headers to internal keys
    const indexMap: Record<string, number> = {};
    
    Object.entries(COLUMN_MAPPING).forEach(([key, possibleNames]) => {
      const index = headers.findIndex(h => possibleNames.some(name => h.includes(name)));
      if (index !== -1) {
        indexMap[key] = index;
      }
    });

    const items: InventoryItem[] = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine = parseCSVLine(lines[i]);
      if (currentLine.length < headers.length) continue;

      const item: any = {};
      
      // Helper to safely get value
      const getVal = (key: string, type: 'string' | 'number' = 'string') => {
        const idx = indexMap[key];
        if (idx === undefined || idx >= currentLine.length) return type === 'number' ? 0 : '';
        const val = currentLine[idx];
        if (type === 'number') {
          // Remove currency symbols, commas if any
          const clean = val.replace(/[^0-9.-]+/g, "");
          return parseFloat(clean) || 0;
        }
        return val;
      };

      item.itemNo = getVal('itemNo');
      item.description = getVal('description');
      item.group = getVal('group');
      item.model = getVal('model');
      item.bhlHlnFlag = getVal('bhlHlnFlag');
      item.hsnTax = getVal('hsnTax', 'number');
      item.saleRate = getVal('saleRate', 'number');
      item.mrp = getVal('mrp', 'number');

      if (item.itemNo && item.description) {
        items.push(item as InventoryItem);
      }
    }

    return items;

  } catch (error) {
    console.error("CSV Fetch Error", error);
    throw error;
  }
};