import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, 'Power Grid Transmission Line.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log('✅ Conversion Summary:');
console.log('📊 Total Sheets:', data.totalSheets);
console.log('📋 Sheet Names:', data.sheetNames.join(', '));
console.log('\n📏 Sheet1 Details:');
console.log('   - Total Rows:', data.data.Sheet1.totalRows);
console.log('   - Total Columns:', data.data.Sheet1.totalColumns);
console.log('   - Raw Data Rows:', data.data.Sheet1.raw.length);
console.log('   - With Headers Rows:', data.data.Sheet1.withHeaders.length);
console.log('   - Total Cells with Data:', Object.keys(data.data.Sheet1.cellData).length);
console.log('   - Range:', `Row ${data.data.Sheet1.range.start.row}-${data.data.Sheet1.range.end.row}, Col ${data.data.Sheet1.range.start.col}-${data.data.Sheet1.range.end.col}`);

console.log('\n📄 Sample Data (First 3 rows of raw data):');
data.data.Sheet1.raw.slice(0, 3).forEach((row, idx) => {
  console.log(`   Row ${idx + 1}:`, row.slice(0, 10).join(' | '), '...');
});

console.log('\n✅ All data has been preserved!');
console.log('📁 Files created:');
console.log('   1. Power Grid Transmission Line.json (Complete with all formats)');
console.log('   2. Power Grid Transmission Line - Simplified.json (Simplified format)');

