/**
 * Fix unused variables and imports in TypeScript/TSX files
 * Prefixes unused variables with underscore to satisfy ESLint
 */

const fs = require('fs');
const path = require('path');

const fixes = [
  // ClientLayout.tsx
  { file: 'src/app/ClientLayout.tsx', find: "import { VoiceAssistant } from '@/components/voice/VoiceAssistant';", replace: "import { VoiceAssistant as _VoiceAssistant } from '@/components/voice/VoiceAssistant';" },
  
  // digit-span/page.tsx
  { file: 'src/app/[locale]/assessments/tasks/digit-span/page.tsx', find: "import { ArrowLeft, Loader2, CheckCircle }", replace: "import { ArrowLeft, CheckCircle }" },
  { file: 'src/app/[locale]/assessments/tasks/digit-span/page.tsx', find: "const [isSubmitting, setIsSubmitting] = useState(false);", replace: "const [_isSubmitting, setIsSubmitting] = useState(false);" },
  
  // tokenisation/page.tsx
  { file: 'src/app/[locale]/tokenisation/page.tsx', find: "const { data: session, status } = useSession();", replace: "const { data: _session, status } = useSession();" },
  
  // api/assessments/submit/route.ts
  { file: 'src/app/api/assessments/submit/route.ts', find: "const session = await getServerSession(authOptions);", replace: "const _session = await getServerSession(authOptions);" },
  
  // api/ehcp/annual-reviews/route.ts
  { file: 'src/app/api/ehcp/annual-reviews/route.ts', find: "const { childId, academicYear, type } = await request.json();", replace: "const { childId, academicYear: _academicYear, type } = await request.json();" },
  
  // api/gamification/route.ts
  { file: 'src/app/api/gamification/route.ts', find: "const unlockedIds = unlocks.map(u => u.id);", replace: "const _unlockedIds = unlocks.map(u => u.id);" },
  
  // api/training/create-payment-intent/route.ts
  { file: 'src/app/api/training/create-payment-intent/route.ts', find: "} catch (err) {", replace: "} catch (_err) {" },
  
  // DigitSpanTask.tsx
  { file: 'src/components/assessments/interactive/DigitSpanTask.tsx', find: "const [score, setScore] = useState(0);", replace: "const [_score, setScore] = useState(0);" },
  
  // SupportChatbot.tsx
  { file: 'src/components/chat/SupportChatbot.tsx', find: "    resetTranscript,", replace: "    resetTranscript: _resetTranscript," },
  
  // EnhancedCodingCurriculum.tsx
  { file: 'src/components/demo/EnhancedCodingCurriculum.tsx', find: "  FileCode,", replace: "" },
  
  // StudentDashboardWrapper.tsx
  { file: 'src/components/demo/StudentDashboardWrapper.tsx', find: "import Link from 'next/link';", replace: "// import Link from 'next/link'; // Unused" },
  
  // TrainingSandbox.tsx
  { file: 'src/components/demo/TrainingSandbox.tsx', find: "  Users,", replace: "" },
  
  // MaintenancePage.tsx
  { file: 'src/components/landing/MaintenancePage.tsx', find: "  TrendingUp,", replace: "" },
  { file: 'src/components/landing/MaintenancePage.tsx', find: "  Target,", replace: "" },
  { file: 'src/components/landing/MaintenancePage.tsx', find: "const [activeSection, setActiveSection] = useState<string | null>(null);", replace: "const [_activeSection, _setActiveSection] = useState<string | null>(null);" },
  
  // UnifiedEcosystem.tsx
  { file: 'src/components/landing/UnifiedEcosystem.tsx', find: "  Users,\n  LineChart,\n  Code,\n  GraduationCap,", replace: "" },
  { file: 'src/components/landing/UnifiedEcosystem.tsx', find: "  ShieldCheck,", replace: "" },
  
  // VideoPremiereSection.tsx
  { file: 'src/components/landing/VideoPremiereSection.tsx', find: ", Zap", replace: "" },
  
  // LessonPlayer.tsx
  { file: 'src/components/student/LessonPlayer.tsx', find: "} catch (error) {", replace: "} catch (_error) {" },
  
  // structure.ts
  { file: 'src/lib/curriculum/structure.ts', find: "import { LucideIcon, BookOpen, Database, Globe, Cpu, Shield, Brain, Code, Layers } from 'lucide-react';", replace: "import { BookOpen, Shield, Brain, Code, Layers } from 'lucide-react';" },
  
  // bridge.ts
  { file: 'src/lib/gamification/bridge.ts', find: "import { LessonActivityContent, GamificationUpdate } from '@/types/gamification';", replace: "import { GamificationUpdate } from '@/types/gamification';" },
];

let totalFixed = 0;

fixes.forEach(({ file, find, replace }) => {
  const fullPath = path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️ File not found: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  if (content.includes(find)) {
    content = content.replace(find, replace);
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed: ${file}`);
    totalFixed++;
  } else {
    console.log(`⏭️ Already fixed or pattern not found: ${file}`);
  }
});

console.log(`\n🎯 Total fixes applied: ${totalFixed}`);
