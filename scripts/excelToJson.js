/**
 * Converts an Excel file to the same JSON format as Power_Grid_Transmission_Line.json
 * Output: { fileName, convertedAt, structure, totalSheets, sheetNames, sheets: { Sheet1: [ ... ] } }
 *
 * Usage: node scripts/excelToJson.js [input.xlsx] [output.json]
 * Default: reads "Power Grid Transmission Line Details.xlsx" from project root, writes to public/<name>.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function normalizeKey(str) {
  if (str == null || str === '') return '';
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/\s*[\|\/\\]+\s*/g, '_')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') || 'col';
}

function ensureUniqueHeaders(headers) {
  const seen = new Map();
  return headers.map((h, i) => {
    let key = h || `col_${i}`;
    if (seen.has(key)) {
      seen.set(key, seen.get(key) + 1);
      key = `${key}_${seen.get(key)}`;
    } else {
      seen.set(key, 0);
    }
    return key;
  });
}

function parseValue(cell) {
  if (cell == null || cell === '') return '';
  if (typeof cell === 'number' && !Number.isNaN(cell)) return String(cell);
  return String(cell).trim();
}

function convertSheetToRows(sheet, options = {}) {
  const { headerRows = 1 } = options;
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (!raw.length) return { headers: [], rows: [] };

  let headerRowIndices = [0];
  if (headerRows === 2 && raw.length > 1) {
    headerRowIndices = [0, 1];
  }

  const mergedHeaders = raw[0].map((_, colIndex) => {
    const parts = headerRowIndices
      .map((rowIndex) => (raw[rowIndex][colIndex] != null ? String(raw[rowIndex][colIndex]).trim() : ''))
      .filter(Boolean);
    return parts.join(' | ') || `col_${colIndex}`;
  });

  const normalized = mergedHeaders.map(normalizeKey);
  const headers = ensureUniqueHeaders(normalized);

  const dataStartRow = headerRowIndices.length;
  const rows = [];
  for (let r = dataStartRow; r < raw.length; r++) {
    const row = raw[r];
    const obj = {};
    headers.forEach((key, c) => {
      obj[key] = parseValue(row[c]);
    });
    rows.push(obj);
  }

  return { headers, rows };
}

function excelToJson(inputPath, outputPath = null) {
  const resolvedInput = path.isAbsolute(inputPath) ? inputPath : path.join(projectRoot, inputPath);
  if (!fs.existsSync(resolvedInput)) {
    throw new Error(`Input file not found: ${resolvedInput}`);
  }

  const workbook = XLSX.readFile(resolvedInput);
  const sheetNames = workbook.SheetNames;
  if (!sheetNames.length) {
    throw new Error('Workbook has no sheets');
  }

  const sheets = {};
  let totalRows = 0;

  for (const sheetName of sheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    // Use 2-row header only if row 1 looks like text (sub-headers), not numeric data
    const row1 = raw[1] || [];
    const numericCount = row1.filter((c) => c != null && String(c).trim() !== '' && !Number.isNaN(Number(c))).length;
    const hasTwoRowHeader = raw.length > 1 && row1.some((c) => c != null && String(c).trim() !== '') && numericCount < row1.length / 2;
    const { rows } = convertSheetToRows(sheet, { headerRows: hasTwoRowHeader ? 2 : 1 });
    sheets[sheetName] = rows;
    totalRows += rows.length;
  }

  const result = {
    fileName: path.basename(resolvedInput),
    convertedAt: new Date().toISOString(),
    structure: 'parent_child',
    totalSheets: sheetNames.length,
    sheetNames,
    sheets,
  };

  const outPath = outputPath
    ? path.isAbsolute(outputPath)
      ? outputPath
      : path.join(projectRoot, outputPath)
    : path.join(projectRoot, 'public', path.basename(resolvedInput, path.extname(resolvedInput)) + '.json');

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');

  return { outputPath: outPath, totalSheets: sheetNames.length, totalRows };
}

const inputFile = process.argv[2] || path.join(projectRoot, 'Power Grid Transmission Line Details.xlsx');
const outputFile = process.argv[3] || null;

try {
  const { outputPath, totalSheets, totalRows } = excelToJson(inputFile, outputFile);
  console.log('Conversion complete.');
  console.log('  Input:', inputFile);
  console.log('  Output:', outputPath);
  console.log('  Sheets:', totalSheets);
  console.log('  Total rows:', totalRows);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
