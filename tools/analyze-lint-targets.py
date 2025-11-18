#!/usr/bin/env python3
"""
Analyze ESLint warnings and identify highest-impact cleanup targets.
"""

import json
import subprocess
import sys
from collections import defaultdict, Counter
from pathlib import Path

def run_eslint():
    """Run ESLint and capture JSON output."""
    result = subprocess.run(
        ["npx", "eslint", ".", "--format=json", "--max-warnings=9999"],
        cwd="/mnt/c/EdpsychConnect",
        capture_output=True,
        text=True
    )
    
    # Parse JSON from stderr/stdout
    output = result.stdout + result.stderr
    for line in output.split('\n'):
        if line.startswith('['):
            try:
                return json.loads(line)
            except json.JSONDecodeError:
                continue
    return []

def analyze_warnings(data):
    """Analyze warnings by rule and file."""
    warnings_by_rule = defaultdict(list)
    warnings_by_file = defaultdict(list)
    
    for file_report in data:
        filepath = file_report.get('filePath', '')
        for message in file_report.get('messages', []):
            rule = message.get('ruleId', 'unknown')
            line = message.get('line', 0)
            column = message.get('column', 0)
            message_text = message.get('message', '')
            
            warnings_by_rule[rule].append({
                'file': filepath,
                'line': line,
                'column': column,
                'message': message_text
            })
            
            warnings_by_file[filepath].append({
                'rule': rule,
                'line': line,
                'message': message_text
            })
    
    return warnings_by_rule, warnings_by_file

def print_summary(warnings_by_rule):
    """Print summary of warnings by rule."""
    print("\n=== LINT WARNING SUMMARY ===\n")
    
    rule_counts = {rule: len(warns) for rule, warns in warnings_by_rule.items()}
    sorted_rules = sorted(rule_counts.items(), key=lambda x: x[1], reverse=True)
    
    total = sum(count for _, count in sorted_rules)
    print(f"Total Warnings: {total}\n")
    print("Top Rules by Frequency:")
    print("-" * 60)
    
    for i, (rule, count) in enumerate(sorted_rules[:20], 1):
        pct = (count / total * 100) if total > 0 else 0
        print(f"{i:2}. {rule:40s} {count:5d} ({pct:5.1f}%)")

def identify_targets(warnings_by_rule):
    """Identify high-impact cleanup targets."""
    print("\n=== HIGH-IMPACT TARGETS ===\n")
    
    # Focus on no-unused-vars
    if 'no-unused-vars' in warnings_by_rule:
        warns = warnings_by_rule['no-unused-vars']
        print(f"no-unused-vars: {len(warns)} warnings")
        
        # Group by file
        by_file = defaultdict(list)
        for w in warns:
            by_file[w['file']].append(w)
        
        # Top files with most warnings
        sorted_files = sorted(by_file.items(), key=lambda x: len(x[1]), reverse=True)
        print("\nTop 20 files:")
        print("-" * 60)
        for i, (filepath, warns) in enumerate(sorted_files[:20], 1):
            rel_path = filepath.replace('/mnt/c/EdpsychConnect/', '')
            print(f"{i:2}. {rel_path:50s} {len(warns):3d} warnings")
        
        # Suggest pattern-based fixes
        print("\n=== PATTERN-BASED FIX OPPORTUNITIES ===")
        patterns = Counter()
        for w in warns[:100]:
            if "is defined but never used" in w['message']:
                var_name = w['message'].split("'")[1] if "'" in w['message'] else "unknown"
                patterns[var_name] += 1
        
        if patterns:
            print(f"\nTop unused variables to prefix with '_':")
            for var, count in patterns.most_common(15):
                print(f"  - {var}: {count} occurrences")

if __name__ == '__main__':
    print("Analyzing ESLint warnings...")
    data = run_eslint()
    
    if not data:
        print("No ESLint output captured. Exiting.")
        sys.exit(1)
    
    warnings_by_rule, warnings_by_file = analyze_warnings(data)
    print_summary(warnings_by_rule)
    identify_targets(warnings_by_rule)
