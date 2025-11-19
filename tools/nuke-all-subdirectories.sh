#!/bin/bash

# Delete students subdirectories
rm -rf src/app/api/students/\[id\]

# Delete study-buddy - it has only flat routes
# rm -rf src/app/api/study-buddy/*  # actually these are flat

# Delete ai subdirectories
rm -rf src/app/api/ai/adaptive src/app/api/ai/demos src/app/api/ai/matcher

# Delete automation subdirectories
rm -rf src/app/api/automation/analytics src/app/api/automation/effectiveness src/app/api/automation/interventions src/app/api/automation/templates

# Delete battle-royale subdirectories  
rm -rf src/app/api/battle-royale/match src/app/api/battle-royale/matchmaking src/app/api/battle-royale/squad

# Delete blog subdirectories
rm -rf src/app/api/blog/\[slug\]  # keep generate as separate

# Delete cases subdirectories
rm -rf src/app/api/cases/\[id\]

# Delete class subdirectories
rm -rf src/app/api/class/\[id\]

# Delete cpd subdirectories
rm -rf src/app/api/cpd/\[id\]  # keep portfolio as part of consolidated

# Delete ethics subdirectories
rm -rf src/app/api/ethics/analytics src/app/api/ethics/assessments src/app/api/ethics/incidents src/app/api/ethics/monitors

# Delete help subdirectories
rm -rf src/app/api/help/\[slug\]

# Delete interventions subdirectories
rm -rf src/app/api/interventions/\[id\]

# Delete lessons subdirectories (already have assign and differentiate)
# already flat

# Delete multi-agency subdirectories
rm -rf src/app/api/multi-agency/ep-dashboard src/app/api/multi-agency/view

# Delete parent subdirectories
rm -rf src/app/api/parent/messages src/app/api/parent/portal

# Delete tokenisation subdirectories
rm -rf src/app/api/tokenisation/rewards src/app/api/tokenisation/treasury

# Delete voice subdirectories
rm -rf src/app/api/voice/command src/app/api/voice/quick-actions

# Delete other nested structures
rm -rf src/app/api/cron/predictions
rm -rf src/app/api/health-dashboard
rm -rf src/app/api/monitoring/dashboard
rm -rf src/app/api/outcomes/track
rm -rf src/app/api/progress/dashboard
rm -rf src/app/api/research/library
rm -rf src/app/api/user/onboarding

echo "Directory cleanup complete"
find src/app/api -type d -empty -delete
echo "Empty directories removed"
