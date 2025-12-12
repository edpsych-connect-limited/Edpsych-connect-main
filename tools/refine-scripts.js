const fs = require('fs');
const path = require('path');

const FILES = [
  'video_scripts/world_class/comprehensive-video-scripts-v4-dr-scott.ts',
  'video_scripts/world_class/innovation-features-v4-dr-scott.ts',
  'scripts/generate-platform-intro-video.ts',
  'scripts/generate-la-dashboard-video.ts',
  'scripts/generate-school-senco-video.ts',
  'scripts/generate-parent-portal-video.ts'
];

const REPLACEMENTS = [
  {
    // Dr. Scott Bio
    find: /In my fifteen years as an Educational Psychologist/g,
    replace: 'In over nine years as a practicing Child and Adolescent Educational Psychologist, and over twenty years in the field across different Local Authorities and schools'
  },
  {
    // Mission Control
    find: /Mission Control for your SEND provision/g,
    replace: 'Mission Control for your Special Educational Needs and Disabilities provision'
  },
  {
    // Abbreviations
    find: /\bEHCP\b/g,
    replace: 'Education, Health and Care Plan'
  },
  {
    find: /\bSEND\b/g,
    replace: 'Special Educational Needs and Disabilities'
  },
  {
    find: /\bLAs\b/g,
    replace: 'Local Authorities'
  },
  {
    find: /\bLA\b/g,
    replace: 'Local Authority'
  },
  {
    find: /\bEPs\b/g,
    replace: 'Educational Psychologists'
  },
  {
    find: /\bEP\b/g,
    replace: 'Educational Psychologist'
  },
  {
    find: /\bSENCOs\b/g,
    replace: 'Special Educational Needs Coordinators'
  },
  {
    find: /\bSENCO\b/g,
    replace: 'Special Educational Needs Coordinator'
  },
  {
    find: /\bADHD\b/g,
    replace: 'Attention Deficit Hyperactivity Disorder'
  },
  {
    find: /\bCPD\b/g,
    replace: 'Continuing Professional Development'
  },
  {
    find: /\bSAR\b/g,
    replace: 'Subject Access Request'
  },
  {
    find: /\bGDPR\b/g,
    replace: 'General Data Protection Regulation'
  },
  {
    find: /\bSALT\b/g,
    replace: 'Speech and Language Therapist'
  },
  {
    find: /\bOTs\b/g,
    replace: 'Occupational Therapists'
  },
  {
    find: /\bOT\b/g,
    replace: 'Occupational Therapist'
  },
  {
    find: /\bSEMH\b/g,
    replace: 'Social, Emotional and Mental Health'
  }
];

FILES.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    REPLACEMENTS.forEach(r => {
      content = content.replace(r.find, r.replace);
    });

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated: ${file}`);
    } else {
      console.log(`No changes needed: ${file}`);
    }
  } else {
    console.log(`File not found: ${file}`);
  }
});
