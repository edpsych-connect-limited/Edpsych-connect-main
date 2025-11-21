#!/bin/bash
npx next build > build_log_final.txt 2>&1
echo "EXIT_CODE: $?" >> build_log_final.txt
