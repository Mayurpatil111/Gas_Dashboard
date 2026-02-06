import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function readJson(relPath) {
  const fullPath = path.isAbsolute(relPath) ? relPath : path.join(projectRoot, relPath);
  const raw = fs.readFileSync(fullPath, 'utf8');
  return { data: JSON.parse(raw), fullPath };
}

function toNumber(value) {
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function mergeTrees() {
  // Load elevation and tree JSON files from public
  const { data: elevationData, fullPath: elevationPath } = readJson('public/Elevation_data_100m_distance.json');
  const { data: treesData } = readJson('public/Trees_odisha.json');

  const elevationRows = elevationData?.sheets?.Sheet1 || [];
  const treeRows = treesData?.sheets?.Sheet1 || [];

  console.log(`Merging ${treeRows.length} tree rows into ${elevationRows.length} elevation rows...`);

  // For each elevation row, attach trees that fall within its chainage interval.
  // We assume each elevation row's chainage C corresponds to tree rows whose
  // chainage_start <= C <= chainage_end.
  for (const row of elevationRows) {
    const cNum = toNumber(row.chainage);
    if (cNum == null) {
      row.trees = [];
      continue;
    }

    const matchingTrees = treeRows.filter((t) => {
      const start = toNumber(t.chainage_start);
      const end = toNumber(t.chainage_end);
      if (start == null || end == null) return false;
      return cNum >= start && cNum <= end;
    });

    // Attach a compact array of tree objects on this elevation row
    row.trees = matchingTrees.map((t) => ({
      height: t.height,
      latitude: t.latitude,
      longitude: t.longitude,
      chainage_start: t.chainage_start,
      chainage_end: t.chainage_end,
    }));
    row.tree_count = row.trees.length;
  }

  // Write back the updated elevation JSON in-place
  fs.writeFileSync(elevationPath, JSON.stringify(elevationData, null, 2), 'utf8');
  console.log('Merge complete. Updated file:', elevationPath);
}

try {
  mergeTrees();
} catch (err) {
  console.error('Error during merge:', err);
  process.exit(1);
}

