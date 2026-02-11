/**
 * Converts Updated Soil Data CSV to JSON
 * Handles two-row header structure (depth groups + parameters)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const csvPath = "C:\\Users\\sandeep.ugale\\Downloads\\Updated Soil Data(Sheet3).csv";
const jsonPath = path.join(projectRoot, 'public', 'DATA_Soil.json');

try {
  // Read CSV file - try UTF-8 first, fallback to latin1 for Windows files
  let csvContent;
  try {
    csvContent = fs.readFileSync(csvPath, { encoding: 'utf8' });
  } catch (e) {
    csvContent = fs.readFileSync(csvPath, { encoding: 'latin1' });
  }
  
  // Parse CSV as raw rows
  const rawRows = parse(csvContent, {
    skip_empty_lines: false,
    trim: true,
    bom: true
  });

  if (rawRows.length < 2) {
    throw new Error('CSV must have at least 2 header rows');
  }

  // Get header rows
  const header1 = rawRows[0]; // e.g. "Locations", "", "", "At 1 m Depth", "", "", ...
  const header2 = rawRows[1]; // e.g. "", "", "", "Dry Density (g/cc)", "Clay %", ...

  // Build combined column names - handle merged headers where "At 1 m Depth" spans multiple columns
  let currentGroup = '';
  const headers = header1.map((group, idx) => {
    const groupName = (group || '').trim();
    const paramName = (header2[idx] || '').trim();
    
    // If we have a new group name, update currentGroup
    if (groupName) {
      currentGroup = groupName;
    }
    
    // Combine group and parameter
    if (currentGroup && paramName) {
      return `${currentGroup} - ${paramName}`;
    } else if (paramName) {
      return paramName;
    } else if (currentGroup) {
      return currentGroup;
    } else {
      return ''; // empty column
    }
  });

  // Process data rows
  const rows = [];
  for (let r = 2; r < rawRows.length; r++) {
    const row = rawRows[r];
    
    // Skip completely empty rows
    if (!row.some(cell => cell && cell.trim() !== '')) {
      continue;
    }
    
    const cleanRow = {};
    headers.forEach((header, idx) => {
      const headerName = header.trim();
      const value = (row[idx] || '').trim();
      
      if (headerName && value !== '') {
        cleanRow[headerName] = value;
      }
    });
    
    if (Object.keys(cleanRow).length > 0) {
      rows.push(cleanRow);
    }
  }

  // Create result structure matching app expectations
  const result = {
    fileName: path.basename(csvPath),
    convertedAt: new Date().toISOString(),
    structure: "parent_child",
    totalSheets: 1,
    sheetNames: ["Sheet3"],
    sheets: {
      Sheet3: rows
    }
  };

  // Write JSON file
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf8');

  console.log(`✅ Converted ${rows.length} rows from Soil Data CSV`);
  console.log(`   Output: ${jsonPath}`);
} catch (error) {
  console.error('❌ Error converting Soil Data CSV:', error.message);
  process.exit(1);
}
