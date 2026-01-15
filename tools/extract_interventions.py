import os
import json
import re

source_path = r"e:\EdpsychConnect\src\lib\interventions\intervention-library.ts"
target_path = r"e:\EdpsychConnect\src\lib\interventions\interventions-data.json"

print(f"Reading source file: {source_path}")

with open(source_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")

# Define boundaries based on previous analysis
# ACADEMIC: lines 89-7115 (approx) - checking for "const ACADEMIC_INTERVENTIONS"
# BEHAVIORAL: checking for "const BEHAVIORAL_INTERVENTIONS"
# SOCIAL_EMOTIONAL: checking for "const SOCIAL_EMOTIONAL_INTERVENTIONS"
# COMMUNICATION: checking for "const COMMUNICATION_INTERVENTIONS"
# SENSORY: checking for "const SENSORY_INTERVENTIONS"

def extract_section(start_marker, lines):
    start_idx = -1
    for i, line in enumerate(lines):
        if start_marker in line:
            start_idx = i
            break
    
    if start_idx == -1:
        print(f"Marker not found: {start_marker}")
        return []

    # Find the opening bracket
    content_start = -1
    for i in range(start_idx, len(lines)):
        if '[' in lines[i]:
            content_start = i
            break
    
    # Find the closing bracket and semi-colon
    # We look for "];" at the start of a line, or just "];"
    content_end = -1
    for i in range(content_start, len(lines)):
        if lines[i].strip().startswith("];") or lines[i].strip().endswith("];"):
            content_end = i
            break
            
    if content_start == -1 or content_end == -1:
        print(f"Could not define boundaries for {start_marker}")
        return []

    print(f"Extracting section for {start_marker} (lines {content_start+1} to {content_end+1})")
    
    # Extract raw content lines between [ and ];
    raw_lines = lines[content_start+1 : content_end]
    raw_text = "".join(raw_lines)
    
    # Basic cleanup to make it JSON-parseable
    # 1. Remove comments
    raw_text = re.sub(r'//.*', '', raw_text)
    
    # 2. Quote keys (id:, name:, etc -> "id":, "name":)
    # This regex looks for word characters followed by colon, not inside quotes
    # It's tricky to get perfect with regex, particularly if text contains colons.
    # A safer approach for this specific file format is manual parsing or AST, 
    # but let's try a robust regex first.
    
    # We will basically evaluate this as a python object since the syntax is very compatible
    # (except for true/false case sensitivity if used as booleans)
    
    return raw_text

# Extract raw text sections
ac_text = extract_section("const ACADEMIC_INTERVENTIONS", lines)
be_text = extract_section("const BEHAVIORAL_INTERVENTIONS", lines)
se_text = extract_section("const SOCIAL_EMOTIONAL_INTERVENTIONS", lines)
co_text = extract_section("const COMMUNICATION_INTERVENTIONS", lines)
sn_text = extract_section("const SENSORY_INTERVENTIONS", lines)

# START ADDITION: Extract .push methods
full_text = "".join(lines)
def extract_pushes(category_name):
    # regex matches: CATEGORY_INTERVENTIONS.push( { ... } );
    # We need to be careful with nested braces. Regex is bad at that.
    # But looking at the file, they seem to be top level.
    # formatting seems consistent: _INTERVENTIONS.push(\n  {\n ... \n  }\n);
    
    # Let's iterate manually to be safe
    pushes = []
    search_str = f"{category_name}_INTERVENTIONS.push("
    
    start_pos = 0
    while True:
        idx = full_text.find(search_str, start_pos)
        if idx == -1:
            break
            
        # Find the opening brace of the object
        brace_start = full_text.find('{', idx)
        
        # Balance braces to find end
        count = 1
        i = brace_start + 1
        while count > 0 and i < len(full_text):
            if full_text[i] == '{':
                count += 1
            elif full_text[i] == '}':
                count -= 1
            i += 1
            
        object_text = full_text[brace_start:i]
        pushes.append(object_text)
        
        start_pos = i
        
    return ",\n".join(pushes)

ac_pushes = extract_pushes("ACADEMIC")
be_pushes = extract_pushes("BEHAVIORAL")
se_pushes = extract_pushes("SOCIAL_EMOTIONAL")
co_pushes = extract_pushes("COMMUNICATION")
sn_pushes = extract_pushes("SENSORY")

def combine(base, added):
    if not base.strip(): return added
    if not added.strip(): return base
    return base + ",\n" + added

ac_final = combine(ac_text, ac_pushes)
be_final = combine(be_text, be_pushes)
se_final = combine(se_text, se_pushes)
co_final = combine(co_text, co_pushes)
sn_final = combine(sn_text, sn_pushes)
# END ADDITION

# Construct a single JS-like string that defines these arrays
full_js = f"""
ACADEMIC = [{ac_final}]
BEHAVIORAL = [{be_final}]
SOCIAL_EMOTIONAL = [{se_final}]
COMMUNICATION = [{co_final}]
SENSORY = [{sn_final}]

ALL_DATA = ACADEMIC + BEHAVIORAL + SOCIAL_EMOTIONAL + COMMUNICATION + SENSORY
"""

# Now we need to make this Python compatible to exec() it
# true -> True, false -> False
full_py = full_js.replace("true", "True").replace("false", "False")

# Handle any other TS specific syntax if present (?)
# The file seems to be mostly clean object literals.

try:
    scope = {}
    exec(full_py, scope)
    all_data = scope['ALL_DATA']
    print(f"Successfully parsed data. Total items: {len(all_data)}")
    
    with open(target_path, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, indent=2)
    print(f"Written to {target_path}")
    
except Exception as e:
    print(f"Error parsing/executing data: {e}")
    # Dump the python code to debug if needed
    with open('debug_extract.py', 'w', encoding='utf-8') as f:
        f.write(full_py)
    print("Debug file written to debug_extract.py")
