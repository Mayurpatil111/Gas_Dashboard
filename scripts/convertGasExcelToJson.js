/**
 * Converts "Updated DATA Gas Pipeline 1.xlsx" to DATA_Gas_Pipeline.json
 * Keeps the original Excel header names exactly as-is (e.g. "Chainage", "Flood Prone Zone Area (Acres)").
 * Output shape matches the existing app expectations:
 * {
 *   fileName,
 *   convertedAt,
 *   structure: "parent_child",
 *   totalSheets: 1,
 *   sheetNames: ["Sheet1"],
 *   sheets: { Sheet1: [ { ...row } ] }
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
const excelPath = "C:\\Users\\sandeep.ugale\\Downloads\\Updated DATA Gas Pipeline 1.xlsx";
const jsonPath = path.join(projectRoot, 'public', 'DATA_Gas_Pipeline.json');

try {
  if (!fs.existsSync(excelPath)) {
    throw new Error(`Excel file not found at path: ${excelPath}`);
  }

  const workbook = XLSX.readFile(excelPath);
  const sheetNames = workbook.SheetNames;
  if (!sheetNames.length) {
    throw new Error('Workbook has no sheets');
  }

  // Use the first sheet from the workbook
  const firstSheetName = sheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];

  // Get raw rows (array of arrays), including header row
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (raw.length < 1) {
    throw new Error('Sheet has no rows');
  }

  const headerRow = raw[0];

  // Build rows, keeping original header text as keys
  const rows = [];
  for (let r = 1; r < raw.length; r++) {
    const row = raw[r];
    // Skip completely empty rows
    if (!row.some((cell) => cell != null && String(cell).trim() !== '')) continue;

    const cleanRow = {};
    headerRow.forEach((header, idx) => {
      const headerName = (header || '').toString().trim();
      const value = (row[idx] ?? '').toString().trim();
      if (!headerName) return;
      if (value === '') return;
      cleanRow[headerName] = value;
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
    sheetNames: ['Sheet1'],
    sheets: {
      // The app reads from sheets.Sheet1, so always expose rows there
      Sheet1: rows,
    },
  };

  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf8');

  console.log(`✅ Converted ${rows.length} rows from Gas Pipeline Excel`);
  console.log(`   Input:  ${excelPath}`);
  console.log(`   Output: ${jsonPath}`);
} catch (error) {
  console.error('❌ Error converting Gas Pipeline Excel:', error.message);
  process.exit(1);
}

