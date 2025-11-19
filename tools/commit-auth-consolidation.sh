#!/bin/bash
cd /mnt/c/EdpsychConnect
git add -A
git commit -m "refactor: consolidate 5 auth routes into single handler to reduce Vercel function count"
git push origin main
