import * as fs from 'fs';
import * as path from 'path';

const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf-8');

// Helper to rename model and add @@map
function renameModel(oldName: string, newName: string) {
  console.log(`Renaming model ${oldName} to ${newName}...`);
  
  // 1. Rename the model definition
  const modelRegex = new RegExp(`model\\s+${oldName}\\s+{`, 'g');
  if (!modelRegex.test(schema)) {
    console.log(`Model ${oldName} not found.`);
    return;
  }
  
  schema = schema.replace(modelRegex, `model ${newName} {`);

  // 2. Add @@map("oldName") before the closing brace of the model
  // We need to find the closing brace of this specific model.
  // This is tricky with regex. We'll assume standard formatting.
  
  // Actually, let's just replace the model definition and then find the end of the block.
  // A safer way is to split by model blocks, but that's complex.
  
  // Let's try a simpler approach: 
  // Find the model block, and insert @@map("oldName") before the last }
  
  // We can iterate line by line.
  const lines = schema.split('\n');
  let insideTargetModel = false;
  let braceCount = 0;
  let modelStartIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith(`model ${newName} {`)) {
      insideTargetModel = true;
      braceCount = 1;
      modelStartIndex = i;
      continue;
    }

    if (insideTargetModel) {
      if (line.includes('{')) braceCount += (line.match(/{/g) || []).length;
      if (line.includes('}')) braceCount -= (line.match(/}/g) || []).length;

      if (braceCount === 0) {
        // Found the end of the model
        // Insert @@map before this line
        lines.splice(i, 0, `  @@map("${oldName}")`);
        insideTargetModel = false;
        i++; // Skip the inserted line
      }
    }
  }
  schema = lines.join('\n');

  // 3. Update references in other models
  // Type references: `field Type` or `field Type[]` or `field Type?`
  // Regex: `(\s+)(\w+)(\s+)(${oldName})(\[\]|\?)?` -> `$1$2$3${newName}$5`
  // But we need to be careful not to replace field names, only types.
  // In Prisma: `fieldName FieldType attributes`
  
  // We can look for ` ${oldName} ` or ` ${oldName}[]` or ` ${oldName}?`
  // And ensure it's not the start of the line (which would be a field name, though field names are usually camelCase).
  
  const typeRegex = new RegExp(`(:\\s*|\\s+)${oldName}(\\[\\]|\\?)?(\\s+|$)`, 'gm');
  schema = schema.replace(typeRegex, (match, prefix, suffix, end) => {
    return `${prefix}${newName}${suffix || ''}${end}`;
  });
}

// Rename specific models
renameModel('users', 'User');
renameModel('students', 'Student');
renameModel('interventions', 'Intervention');
renameModel('assessments', 'Assessment'); // This might conflict if Assessment already exists
renameModel('provisions', 'Provision'); // If it exists

// Fix for missing models (Add them if they don't exist)
// We'll check if they exist first.

function addModelIfMissing(modelName: string, definition: string) {
  if (!schema.includes(`model ${modelName} {`)) {
    console.log(`Adding missing model ${modelName}...`);
    schema += '\n\n' + definition;
  }
}

// Provision model (inferred from usage)
addModelIfMissing('Provision', `
model Provision {
  id              String   @id @default(cuid())
  schoolId        String
  name            String
  areaOfNeed      String
  wave            String
  description     String?
  staffRatio      Float?
  groupSize       Int?
  frequency       String?
  duration        Int?
  costPerSession  Float?
  costPerWeek     Float?
  weeksPerYear    Int?
  totalAnnualCost Float?
  fundingSource   String?
  academicYear    String
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@map("provisions_custom") // Map to a custom table to avoid conflicts
}
`);

// SENDRegister model
addModelIfMissing('SENDRegister', `
model SENDRegister {
  id            String   @id @default(cuid())
  schoolId      String
  studentId     String
  academicYear  String
  
  needs         String[]
  provisions    String[]
  outcomes      String[]
  
  startDate     DateTime
  endDate       DateTime?
  status        String
  sendStatus    String? // EHCP, EHCP_ASSESSMENT, SEN_SUPPORT
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("send_registers")
}
`);

// ActionItem model
addModelIfMissing('ActionItem', `
model ActionItem {
  id          String   @id @default(cuid())
  title       String
  description String?
  status      String
  priority    String
  dueDate     DateTime?
  assigneeId  String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("action_items")
}
`);

// SchoolStaff model
addModelIfMissing('SchoolStaff', `
model SchoolStaff {
  id        String   @id @default(cuid())
  name      String
  role      String
  email     String
  schoolId  String
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("school_staff")
}
`);

// ReviewMeeting model
addModelIfMissing('ReviewMeeting', `
model ReviewMeeting {
  id          String   @id @default(cuid())
  date        DateTime
  type        String
  status      String
  studentId   String
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("review_meetings")
}
`);

// ParentPortalSession model
addModelIfMissing('ParentPortalSession', `
model ParentPortalSession {
  id        String   @id @default(cuid())
  userId    String
  duration  Int
  
  createdAt DateTime @default(now())
  
  @@map("parent_portal_sessions")
}
`);

// ParentMessage model
addModelIfMissing('ParentMessage', `
model ParentMessage {
  id        String   @id @default(cuid())
  senderId  String
  content   String
  read      Boolean @default(false)
  
  createdAt DateTime @default(now())
  
  @@map("parent_messages")
}
`);

// DocumentView model
addModelIfMissing('DocumentView', `
model DocumentView {
  id         String   @id @default(cuid())
  documentId String
  viewerId   String
  viewedAt   DateTime @default(now())
  
  @@map("document_views")
}
`);

// Meeting model
addModelIfMissing('Meeting', `
model Meeting {
  id        String   @id @default(cuid())
  title     String
  date      DateTime
  
  createdAt DateTime @default(now())
  
  @@map("meetings_custom")
}
`);

// Document model
addModelIfMissing('Document', `
model Document {
  id        String   @id @default(cuid())
  title     String
  url       String
  type      String
  
  createdAt DateTime @default(now())
  
  @@map("documents_custom")
}
`);

// StaffAllocation model
addModelIfMissing('StaffAllocation', `
model StaffAllocation {
  id          String   @id @default(cuid())
  staffId     String
  provisionId String
  hours       Float
  
  createdAt   DateTime @default(now())
  
  @@map("staff_allocations")
}
`);

// ExternalSpecialist model
addModelIfMissing('ExternalSpecialist', `
model ExternalSpecialist {
  id        String   @id @default(cuid())
  name      String
  specialty String
  cost      Float
  
  createdAt DateTime @default(now())
  
  @@map("external_specialists")
}
`);

// SchoolBudget model
addModelIfMissing('SchoolBudget', `
model SchoolBudget {
  id           String   @id @default(cuid())
  schoolId     String
  academicYear String
  totalAmount  Float
  
  createdAt    DateTime @default(now())
  
  @@map("school_budgets")
}
`);

// ProvisionAllocation model
addModelIfMissing('ProvisionAllocation', `
model ProvisionAllocation {
  id          String   @id @default(cuid())
  provisionId String
  studentId   String
  status      String
  startDate   DateTime
  endDate     DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("provision_allocations")
}
`);

// ProvisionMap model
addModelIfMissing('ProvisionMap', `
model ProvisionMap {
  id           String   @id @default(cuid())
  schoolId     String
  academicYear String
  status       String
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@map("provision_maps")
}
`);

// SENDOutcome model
addModelIfMissing('SENDOutcome', `
model SENDOutcome {
  id          String   @id @default(cuid())
  description String
  status      String
  
  createdAt   DateTime @default(now())
  
  @@map("send_outcomes")
}
`);

// ParentConsent model
addModelIfMissing('ParentConsent', `
model ParentConsent {
  id        String   @id @default(cuid())
  type      String
  granted   Boolean
  
  createdAt DateTime @default(now())
  
  @@map("parent_consents")
}
`);

// RiskAssessment model
addModelIfMissing('RiskAssessment', `
model RiskAssessment {
  id        String   @id @default(cuid())
  title     String
  riskLevel String
  
  createdAt DateTime @default(now())
  
  @@map("risk_assessments")
}
`);

// EHCPAssessment model (if missing)
addModelIfMissing('EHCPAssessment', `
model EHCPAssessment {
  id        String   @id @default(cuid())
  studentId String
  status    String
  
  createdAt DateTime @default(now())
  
  @@map("ehcp_assessments_custom")
}
`);


fs.writeFileSync(schemaPath, schema);
console.log('Schema updated successfully.');
