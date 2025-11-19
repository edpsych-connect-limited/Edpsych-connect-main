#!/bin/bash

#
# Enterprise Validation Framework Setup
# Initializes the validation framework for your project
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  ENTERPRISE VALIDATION FRAMEWORK SETUP${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"

# Check Node.js
echo -e "${YELLOW}Checking environment...${NC}"
if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js not found${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
if npm install typescript --save-dev; then
  echo -e "${GREEN}✓ Dependencies installed${NC}"
fi

# Create git hook
echo -e "\n${YELLOW}Setting up git hooks...${NC}"
if mkdir -p .git/hooks && cp tools/pre-commit-validate.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit; then
  echo -e "${GREEN}✓ Pre-commit hook installed${NC}"
else
  echo -e "${YELLOW}⚠ Could not install pre-commit hook${NC}"
fi

# Create validation directories
echo -e "\n${YELLOW}Creating validation directories...${NC}"
mkdir -p src/lib/validation
mkdir -p docs/validation-reports
echo -e "${GREEN}✓ Directories created${NC}"

# Build CLI
echo -e "\n${YELLOW}Building CLI tool...${NC}"
if npx tsc tools/validate-code.ts --outDir tools --declaration; then
  echo -e "${GREEN}✓ CLI tool built${NC}"
fi

# Run initial validation
echo -e "\n${YELLOW}Running initial validation...${NC}"
if npx tsc --noEmit; then
  echo -e "${GREEN}✓ TypeScript compilation passed${NC}"
else
  echo -e "${YELLOW}⚠ TypeScript compilation has warnings${NC}"
fi

# Display summary
echo -e "\n${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}SETUP COMPLETE${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"

echo -e "📚 Documentation:"
echo -e "  Read: ${YELLOW}docs/CODE_VALIDATION_FRAMEWORK.md${NC}\n"

echo -e "🚀 Quick Start:"
echo -e "  1. Validate a file:"
echo -e "     ${YELLOW}npx validate-code validate-file src/lib/services/myService.ts${NC}"
echo -e ""
echo -e "  2. Validate a directory:"
echo -e "     ${YELLOW}npx validate-code validate-dir src/lib/services${NC}"
echo -e ""
echo -e "  3. Run build validation:"
echo -e "     ${YELLOW}npm run validate:build${NC}"
echo -e ""
echo -e "  4. Generate report:"
echo -e "     ${YELLOW}npx validate-code report src${NC}\n"

echo -e "🔧 Configuration:"
echo -e "  - Edit ${YELLOW}src/lib/validation/validationService.ts${NC} to customize"
echo -e "  - Exclude patterns: Update ${YELLOW}excludePatterns${NC} option"
echo -e "  - Strict mode: Set ${YELLOW}strictMode: true${NC} for production\n"

echo -e "📝 Next Steps:"
echo -e "  1. Add to package.json:"
echo -e "     ${YELLOW}\"validate\": \"npx validate-code validate-dir src\"${NC}"
echo -e ""
echo -e "  2. Update build script:"
echo -e "     ${YELLOW}\"build\": \"npm run validate && next build\"${NC}"
echo -e ""
echo -e "  3. Commit changes:"
echo -e "     ${YELLOW}git add . && git commit -m 'Setup validation framework'${NC}\n"

echo -e "${GREEN}Setup complete! Happy coding! 🎉${NC}\n"
