
import os

source_path = 'src/lib/interventions/intervention-library.ts'

def refactor_file():
    with open(source_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Part 1: Header (Types)
    # Stop before "ACADEMIC INTERVENTIONS"
    header_end_index = 0
    for i, line in enumerate(lines[:200]):
        if 'ACADEMIC INTERVENTIONS' in line and '====' in line:
            header_end_index = i - 1 # Go back to before the comment block
            break
            
    if header_end_index == 0:
        print("Error: Could not find ACADEMIC INTERVENTIONS start.")
        return

    header_lines = lines[:header_end_index]

    # Part 2: Utils and Stats
    # Find "UTILITY FUNCTIONS"
    utils_start_index = 0
    # Search backwards from the end, or from ~11000
    for i in range(len(lines) - 2000, len(lines)):
        if 'UTILITY FUNCTIONS' in line and '====' in lines[i]:
            utils_start_index = i - 1 # Include the comment block separator if possible, usually there is one before
            break
            
    if utils_start_index == 0:
        # Try searching for the text "UTILITY FUNCTIONS" more broadly
        for i, line in enumerate(lines):
             if 'UTILITY FUNCTIONS' in line:
                 utils_start_index = i - 2
                 break
    
    if utils_start_index == 0:
        print("Error: Could not find UTILITY FUNCTIONS start.")
        return

    footer_lines = lines[utils_start_index:]

    # Construct the middle part
    middle_code = """
import interventionsData from './interventions-data.json';

// ============================================================================
// DATA IMPORT & RECONSTRUCTION
// ============================================================================

// Cast JSON data to strict types
const ALL_DATA = interventionsData as unknown as InterventionTemplate[];

// Reconstruct category arrays for statistics
const ACADEMIC_INTERVENTIONS = ALL_DATA.filter(i => i.category === 'academic');
const BEHAVIORAL_INTERVENTIONS = ALL_DATA.filter(i => i.category === 'behavioural');
const SOCIAL_EMOTIONAL_INTERVENTIONS = ALL_DATA.filter(i => i.category === 'social_emotional');
const COMMUNICATION_INTERVENTIONS = ALL_DATA.filter(i => i.category === 'communication');
const SENSORY_INTERVENTIONS = ALL_DATA.filter(i => i.category === 'sensory');

// Export the full library
export const INTERVENTION_LIBRARY: InterventionTemplate[] = ALL_DATA;

"""

    # Combine
    new_content = "".join(header_lines) + middle_code + "".join(footer_lines)

    # Write
    with open(source_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"Refactored {source_path}. Original lines: {len(lines)}. New lines: {len(new_content.splitlines())}")

if __name__ == '__main__':
    refactor_file()
