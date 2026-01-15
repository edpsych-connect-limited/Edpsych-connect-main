# PowerShell script to extract intervention data without Node.js
Write-Host "[1/5] Reading intervention-library.ts..."
$content = Get-Content "e:\EdpsychConnect\src\lib\interventions\intervention-library.ts" -Raw
$lines = $content -split "`n"
Write-Host "✓ Loaded $($lines.Length) lines"

Write-Host "[2/5] Extracting intervention arrays..."
# Extract each array section by line number
function Extract-Array {
    param($StartLine, $EndLine)
    $arrayLines = $lines[($StartLine-1)..($EndLine-1)]
    $arrayContent = $arrayLines -join "`n"
    
    # Find array brackets
    $startIdx = $arrayContent.IndexOf('[')
    $endIdx = $arrayContent.LastIndexOf('];')
    
    if ($startIdx -eq -1 -or $endIdx -eq -1) {
        Write-Error "Could not find array boundaries in lines $StartLine-$EndLine"
        return $null
    }
    
    return $arrayContent.Substring($startIdx + 1, $endIdx - $startIdx - 1).Trim()
}

$academic = Extract-Array -StartLine 89 -EndLine 7115
$behavioral = Extract-Array -StartLine 7116 -EndLine 8366
$socialEmotional = Extract-Array -StartLine 8367 -EndLine 11424
$communication = Extract-Array -StartLine 11425 -EndLine 11626
$sensory = Extract-Array -StartLine 11627 -EndLine 11965

Write-Host "✓ Extracted 5 arrays"

Write-Host "[3/5] Building JavaScript code..."
$jsCode = @"
const ACADEMIC_INTERVENTIONS = [
  $academic
];

const BEHAVIORAL_INTERVENTIONS = [
  $behavioral
];

const SOCIAL_EMOTIONAL_INTERVENTIONS = [
  $socialEmotional
];

const COMMUNICATION_INTERVENTIONS = [
  $communication
];

const SENSORY_INTERVENTIONS = [
  $sensory
];

module.exports = {
  ACADEMIC_INTERVENTIONS,
  BEHAVIORAL_INTERVENTIONS,
  SOCIAL_EMOTIONAL_INTERVENTIONS,
  COMMUNICATION_INTERVENTIONS,
  SENSORY_INTERVENTIONS
};
"@

$tempFile = "e:\EdpsychConnect\tools\temp-interventions.cjs"
Write-Host "[4/5] Writing temporary file..."
$jsCode | Out-File -FilePath $tempFile -Encoding UTF8
Write-Host "✓ Created temp file ($([math]::Round($jsCode.Length / 1024, 0)) KB)"

Write-Host "[5/5] Converting to JSON..."
try {
    Push-Location "e:\EdpsychConnect"
    $data = node -e "const d = require('./tools/temp-interventions.cjs'); console.log(JSON.stringify([...d.ACADEMIC_INTERVENTIONS, ...d.BEHAVIORAL_INTERVENTIONS, ...d.SOCIAL_EMOTIONAL_INTERVENTIONS, ...d.COMMUNICATION_INTERVENTIONS, ...d.SENSORY_INTERVENTIONS], null, 2));" 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Node.js failed with exit code $LASTEXITCODE"
        Write-Error "Output: $data"
        Pop-Location
        exit 1
    }
    
    $data | Out-File -FilePath "src/lib/interventions/interventions-data.json" -Encoding UTF8
    Write-Host "✅ SUCCESS: Created interventions-data.json"
    
    Remove-Item $tempFile -ErrorAction SilentlyContinue
    Write-Host "✓ Cleaned up temp file"
    Pop-Location
    
} catch {
    Write-Error "Failed: $_"
    Pop-Location
    exit 1
}
