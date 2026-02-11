/**
 * Converts "Soil Data 10km 1 1.xlsx" to DATA_Soil.json
 * Handles two-row header structure (depth groups + parameters),
 * producing combined keys like "At 1 m Depth - Dry Density (g/cc)".
 * Output shape matches existing app expectations:
 * {
 *   fileName,
 *   convertedAt,
 *   structure: "parent_child",
 *   totalSheets: 1,
 *   sheetNames: ["Sheet3"],
 *   sheets: { Sheet3: [ { ...row } ] }
 * }
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Absolute path provided by the user
const excelPath = "C:\\Users\\sandeep.ugale\\Downloads\\Soil Data 10km 1 1.xlsx";
const jsonPath = path.join(projectRoot, 'public', 'DATA_Soil.json');

try {
  if (!fs.existsSync(excelPath)) {
    throw new Error(`Excel file not found at path: ${excelPath}`);
  }

  const workbook = XLSX.readFile(excelPath);
  const sheetNames = workbook.SheetNames;
  if (!sheetNames.length) {
    throw new Error('Workbook has no sheets');
  }

  const firstSheetName = sheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];

  // Read raw rows (array of arrays)
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (rawRows.length < 2) {
    throw new Error('Excel sheet must have at least 2 header rows');
  }

  // Header rows: first for group (At 1 m Depth), second for parameter (Dry Density, Clay, etc.)
  const header1 = rawRows[0];
  const header2 = rawRows[1];

  // Build combined column names similar to convertSoilCsvToJson
  let currentGroup = '';
  const headers = header1.map((group, idx) => {
    const groupName = (group || '').toString().trim();
    const paramName = (header2[idx] || '').toString().trim();

    if (groupName) {
      currentGroup = groupName;
    }

    if (currentGroup && paramName) {
      return `${currentGroup} - ${paramName}`;
    } else if (paramName) {
      return paramName;
    } else if (currentGroup) {
      return currentGroup;
    } else {
      return '';
    }
  });

  const rows = [];
  for (let r = 2; r < rawRows.length; r++) {
    const row = rawRows[r];

    // Skip completely empty rows
    if (!row.some((cell) => cell != null && String(cell).trim() !== '')) {
      continue;
    }

    const cleanRow = {};
    headers.forEach((header, idx) => {
      const headerName = (header || '').toString().trim();
      const value = (row[idx] || '').toString().trim();

      if (headerName && value !== '') {
        cleanRow[headerName] = value;
      }
    });

    if (Object.keys(cleanRow).length > 0) {
      rows.push(cleanRow);
    }
  }

  const result = {
    fileName: path.basename(excelPath),
    convertedAt: new Date().toISOString(),
    structure: 'parent_child',
    totalSheets: 1,
    sheetNames: ['Sheet3'],
    sheets: {
      // The app reads from sheets.Sheet3, so always expose rows there
      Sheet3: rows,
    },
  };

  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf8');

  console.log(`✅ Converted ${rows.length} rows from Soil Excel`);
  console.log(`   Input:  ${excelPath}`);
  console.log(`   Output: ${jsonPath}`);
} catch (error) {
  console.error('❌ Error converting Soil Excel:', error.message);
  process.exit(1);
}

