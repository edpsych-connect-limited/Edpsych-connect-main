const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf-8');

// Helper to revert rename
function revertRename(oldName, newName) {
  console.log(`Reverting ${newName} to ${oldName}...`);
  // Rename model definition
  schema = schema.replace(new RegExp(`model ${newName} \\{`, 'g'), `model ${oldName} {`);
  // Remove @@map
  schema = schema.replace(new RegExp(`\\s+@@map\\("${oldName}"\\)`, 'g'), '');
  // Rename references
  // Type Field[] -> oldName Field[]
  // Type Field -> oldName Field
  const typeRegex = new RegExp(`(:\\s*|\\s+)${newName}(\\[\\]|\\?)?(\\s+|$)`, 'gm');
  schema = schema.replace(typeRegex, (match, prefix, suffix, end) => {
    return `${prefix}${oldName}${suffix || ''}${end}`;
  });
}

revertRename('users', 'User');
revertRename('students', 'Student');
revertRename('interventions', 'Intervention');
revertRename('assessments', 'Assessment');
revertRename('provisions', 'Provision');

fs.writeFileSync(schemaPath, schema);

// 2. Run prisma generate
console.log('Running prisma generate...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch (e) {
  console.error('Prisma generate failed:', e.message);
}

// 3. Fix code references (Revert to plural)
function replaceInFile(filePath, search, replace) {
  const content = fs.readFileSync(filePath, 'utf-8');
  if (content.includes(search)) {
    const newContent = content.replace(new RegExp(search.replace(/\./g, '\\.'), 'g'), replace);
    fs.writeFileSync(filePath, newContent);
    console.log(`Fixed ${search} -> ${replace} in ${filePath}`);
  }
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        walkDir(filePath, callback);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
      callback(filePath);
    }
  });
}

console.log('Reverting code references...');
const srcDir = path.join(process.cwd(), 'src');
walkDir(srcDir, (filePath) => {
  replaceInFile(filePath, 'prisma.assessment', 'prisma.assessments');
  replaceInFile(filePath, 'prisma.user', 'prisma.users');
  replaceInFile(filePath, 'prisma.student', 'prisma.students');
  replaceInFile(filePath, 'prisma.intervention', 'prisma.interventions');
  replaceInFile(filePath, 'prisma.provision', 'prisma.provisions');
});

console.log('Revert complete.');

