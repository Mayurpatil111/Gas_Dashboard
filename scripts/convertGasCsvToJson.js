/**
 * Converts Updated DATA Gas Pipeline CSV to JSON
 * Keeps original field names from CSV (including "Plot/ Survey No.")
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const csvPath = "C:\\Users\\sandeep.ugale\\Downloads\\Updated DATA Gas Pipeline(Sheet1).csv";
const jsonPath = path.join(projectRoot, 'public', 'DATA_Gas_Pipeline.json');

// No header renaming - keep original field names from CSV
const headerRename = {};

try {
  // Read CSV file - try UTF-8 first, fallback to latin1 for Windows files
  let csvContent;
  try {
    csvContent = fs.readFileSync(csvPath, { encoding: 'utf8' });
  } catch (e) {
    csvContent = fs.readFileSync(csvPath, { encoding: 'latin1' });
  }
  
  // Parse CSV
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true
  });

  // Process rows and rename headers
  const rows = records.map(rawRow => {
    const cleanRow = {};
    for (const [originalKey, value] of Object.entries(rawRow)) {
      if (originalKey == null) continue;
      
      // Keep original key (no renaming)
      const newKey = originalKey;
      
      // Clean value
      const cleanValue = typeof value === 'string' ? value.trim() : value;
      
      // Only include non-empty values
      if (cleanValue !== '') {
        cleanRow[newKey] = cleanValue;
      }
    }
    return cleanRow;
  }).filter(row => Object.keys(row).length > 0);

  // Create result structure matching app expectations
  const result = {
    fileName: path.basename(csvPath),
    convertedAt: new Date().toISOString(),
    structure: "parent_child",
    totalSheets: 1,
    sheetNames: ["Sheet1"],
    sheets: {
      Sheet1: rows
    }
  };

  // Write JSON file
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf8');

  console.log(`✅ Converted ${rows.length} rows from Gas Pipeline CSV`);
  console.log(`   Output: ${jsonPath}`);
} catch (error) {
  console.error('❌ Error converting Gas Pipeline CSV:', error.message);
  process.exit(1);
}
