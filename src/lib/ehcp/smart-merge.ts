/**
 * Smart EHCP Merge Utility
 * ------------------------
 * Heuristic-based merging logic to simulate AI-powered alignment of professional reports.
 * Extracts key recommendations, identifies conflicts, and groups by domain.
 */

interface Contribution {
  professionalRole: string;
  professionalName: string;
  content: string;
}

interface MergedSection {
  content: string;
  conflicts: string[];
}

// Keywords for classification
const KEYWORDS = {
  need: ['difficulty', 'struggle', 'unable', 'cannot', 'needs to', 'requires', 'deficit', 'delay', 'impairment'],
  provision: ['should', 'must', 'support', 'intervention', 'therapy', 'session', 'program', 'strategy', 'aid', 'equipment'],
  outcome: ['will', 'achieve', 'target', 'goal', 'aim', 'by the end of'],
};

// Domains for grouping
const DOMAINS = {
  cognition: ['memory', 'processing', 'reading', 'writing', 'maths', 'number', 'literacy', 'cognitive', 'learning'],
  communication: ['speech', 'language', 'vocabulary', 'understanding', 'expressive', 'receptive', 'social skills', 'interaction'],
  semh: ['anxiety', 'behaviour', 'emotional', 'social', 'friends', 'relationships', 'focus', 'attention', 'impulsive'],
  sensory: ['motor', 'sensory', 'hearing', 'vision', 'physical', 'coordination', 'movement', 'writing'],
};

export function smartMergeContributions(contributions: Contribution[]): MergedSection {
  const allSentences: { text: string; source: string; role: string; domain: string; type: string }[] = [];
  const conflicts: string[] = [];

  // 1. Parse and Classify
  contributions.forEach(contrib => {
    // Split by full stops, but respect abbreviations
    const sentences = contrib.content.match(/[^.!?]+[.!?]+/g) || [contrib.content];
    
    sentences.forEach(sentence => {
      const cleanSentence = sentence.trim();
      if (cleanSentence.length < 5) return;

      // Determine Type
      let type = 'general';
      if (KEYWORDS.provision.some(k => cleanSentence.toLowerCase().includes(k))) type = 'provision';
      else if (KEYWORDS.outcome.some(k => cleanSentence.toLowerCase().includes(k))) type = 'outcome';
      else if (KEYWORDS.need.some(k => cleanSentence.toLowerCase().includes(k))) type = 'need';

      // Determine Domain
      let domain = 'general';
      for (const [d, keys] of Object.entries(DOMAINS)) {
        if (keys.some(k => cleanSentence.toLowerCase().includes(k))) {
          domain = d;
          break;
        }
      }

      allSentences.push({
        text: cleanSentence,
        source: contrib.professionalName,
        role: contrib.professionalRole,
        domain,
        type
      });
    });
  });

  // 2. Group and Deduplicate
  const groupedContent: Record<string, string[]> = {};
  
  // Initialize groups
  ['cognition', 'communication', 'semh', 'sensory', 'general'].forEach(d => groupedContent[d] = []);

  allSentences.forEach(s => {
    // Simple deduplication check (Levenshtein-ish or substring)
    const isDuplicate = groupedContent[s.domain].some(existing => 
      existing.includes(s.text) || s.text.includes(existing) || 
      (s.text.length > 10 && existing.substring(0, 20) === s.text.substring(0, 20))
    );

    if (!isDuplicate) {
      // Check for conflicts (heuristic: same domain, different numbers)
      const numberMatch = s.text.match(/\d+/);
      if (numberMatch) {
        const conflicting = groupedContent[s.domain].find(existing => {
          const existingNum = existing.match(/\d+/);
          return existingNum && existingNum[0] !== numberMatch[0] && existing.includes('hours');
        });
        
        if (conflicting) {
          conflicts.push(`Conflict in ${s.domain}: "${s.text}" (${s.role}) vs "${conflicting}"`);
        }
      }

      groupedContent[s.domain].push(`- ${s.text} [${s.role}]`);
    }
  });

  // 3. Format Output
  let finalContent = "## Integrated Professional Advice\n\n";

  if (groupedContent.cognition.length > 0) {
    finalContent += "### Cognition and Learning\n" + groupedContent.cognition.join('\n') + "\n\n";
  }
  if (groupedContent.communication.length > 0) {
    finalContent += "### Communication and Interaction\n" + groupedContent.communication.join('\n') + "\n\n";
  }
  if (groupedContent.semh.length > 0) {
    finalContent += "### Social, Emotional and Mental Health\n" + groupedContent.semh.join('\n') + "\n\n";
  }
  if (groupedContent.sensory.length > 0) {
    finalContent += "### Sensory and Physical\n" + groupedContent.sensory.join('\n') + "\n\n";
  }
  if (groupedContent.general.length > 0) {
    finalContent += "### General Observations\n" + groupedContent.general.join('\n') + "\n\n";
  }

  return {
    content: finalContent,
    conflicts
  };
}
