const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const replacements = [
  { from: /prisma\.studentsProfile/g, to: 'prisma.studentProfile' },
  { from: /prisma\.usersInterest/g, to: 'prisma.userInterest' },
  { from: /prisma\.studentsOutcomePrediction/g, to: 'prisma.studentOutcomePrediction' },
  { from: /prisma\.assessmentsInstance/g, to: 'prisma.assessmentInstance' },
  { from: /prisma\.provisionsMap/g, to: 'prisma.provisionMap' },
  { from: /prisma\.actionItems/g, to: 'prisma.actionItem' }, // Assuming ActionItem model
  { from: /prisma\.reviewMeetings/g, to: 'prisma.reviewMeeting' }, // Assuming ReviewMeeting model
  { from: /prisma\.parentPortalSessions/g, to: 'prisma.parentPortalSession' },
  { from: /prisma\.parentMessages/g, to: 'prisma.parentMessage' },
  { from: /prisma\.documentViews/g, to: 'prisma.documentView' },
  { from: /prisma\.staffAllocations/g, to: 'prisma.staffAllocation' },
  { from: /prisma\.externalSpecialists/g, to: 'prisma.externalSpecialist' },
  { from: /prisma\.schoolBudgets/g, to: 'prisma.schoolBudget' },
];

const files = getAllFiles('./src');
let fixedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  replacements.forEach(rep => {
    content = content.replace(rep.from, rep.to);
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`Fixed ${file}`);
    fixedCount++;
  }
});

console.log(`Fixed ${fixedCount} files.`);
