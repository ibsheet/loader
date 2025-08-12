// scripts/cleanDist.cjs
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');

function deleteFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isFile()) {
      fs.unlinkSync(fullPath);
    } else if (entry.isDirectory()) {
      deleteFiles(fullPath);
    }
  }
}

deleteFiles(distDir);