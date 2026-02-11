/**
 * Converts "Ground Elevation.xlsx" to Elevation.json
 *
 * Your Excel has ONLY TWO columns:
 *   - Chainage
 *   - Elevation
 *
 * This script:
 *   - Reads the first sheet from the Excel file
 *   - Finds the "Chainage" and "Elevation" columns by header text
 *   - Exports JSON as:
 *     {
 *       fileName,
 *       convertedAt,
 *       structure: "parent_child",
 *       totalSheets: 1,
 *       sheetNames: ["Sheet1"],
 *       sheets: {
 *         Sheet1: [
 *           { chainage: "...", elevation: "..." },
 *           ...
 *         ]
 *       }
 *     }
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Absolute path provided by the user
const excelPath = "C:\\Users\\sandeep.ugale\\Downloads\\Ground Elevation.xlsx";
const jsonPath = path.join(projectRoot, 'public', 'Elevation.json');

function findColumnIndex(headers, keywords) {
  const lowerKeywords = keywords.map((k) => k.toLowerCase());
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i];
    if (!h) continue;
    const lower = String(h).toLowerCase();
    if (lowerKeywords.some((kw) => lower.includes(kw))) {
      return i;
    }
  }
  return -1;
}

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
  if (rawRows.length < 1) {
    throw new Error('Excel sheet has no rows');
  }

  const headerRow = rawRows[0];

  // Detect important columns by header text (only Chainage & Elevation)
  const chainageCol = findColumnIndex(headerRow, ['chainage']);
  const elevCol = findColumnIndex(headerRow, ['elevation', 'ground elevation', 'elev']);

  if (chainageCol === -1) throw new Error('Could not find "Chainage" column in Ground Elevation.xlsx');
  if (elevCol === -1) throw new Error('Could not find Elevation column in Ground Elevation.xlsx');

  const rows = [];
  for (let r = 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || !row.length) continue;

    const chainageRaw = row[chainageCol];
    const elevRaw = row[elevCol];

    // Skip rows without essential values
    if (
      chainageRaw == null ||
      String(chainageRaw).trim() === '' ||
      elevRaw == null ||
      String(elevRaw).trim() === ''
    ) {
      continue;
    }

    const cleanRow = {
      chainage: String(chainageRaw).trim(),
      elevation: String(elevRaw).trim(),
    };

    rows.push(cleanRow);
  }

  const result = {
    fileName: path.basename(excelPath),
    convertedAt: new Date().toISOString(),
    structure: 'parent_child',
    totalSheets: 1,
    sheetNames: ['Sheet1'],
    sheets: {
      Sheet1: rows,
    },
  };

  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf8');

  console.log(`✅ Converted ${rows.length} rows from Ground Elevation Excel`);
  console.log(`   Input:  ${excelPath}`);
  console.log(`   Output: ${jsonPath}`);
} catch (error) {
  console.error('❌ Error converting Ground Elevation Excel:', error.message);
  process.exit(1);
}

