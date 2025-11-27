# EdPsych Connect - Intellectual Property Protection Guide

## Overview

This document outlines the code protection measures implemented in EdPsych Connect to safeguard intellectual property and prevent unauthorized copying or reverse engineering.

## Protection Layers Implemented

### 1. Build-Time Protection (`next.config.protected.js`)

When you're ready for production deployment, rename this file to `next.config.js`:

**Features:**
- **Source map removal** - Production builds don't include source maps
- **Console log stripping** - All debug logs removed from production
- **Code minification** - Terser with aggressive settings
- **Property mangling** - Private properties (starting with `_`) are renamed
- **Chunk name obfuscation** - Output files use content hashes instead of readable names
- **Comment removal** - All comments stripped from production code

### 2. Runtime Protection (`src/lib/secure-config.ts`)

**Features:**
- **Configuration obfuscation** - Sensitive values XOR-encrypted in memory
- **Secure configuration singleton** - Single point of access for sensitive data
- **Sensitive data masking** - Automatic masking for logs and errors
- **Environment isolation** - Clear dev/prod mode detection

### 3. Algorithm Protection (`src/lib/core-algorithms.ts`)

**Features:**
- **Abstracted implementations** - Core logic separated into private functions
- **Numeric constants** - Readable strings replaced with numeric flags
- **Version fingerprinting** - Algorithm version tracking for integrity checks
- **Obfuscated exports** - Public API minimized and obscured

## What This Protects

| Asset | Protection Level | Method |
|-------|------------------|--------|
| Business logic | High | Minification + mangling |
| Algorithm weights | High | Numeric constants + abstraction |
| API routes | Medium | Server-side only execution |
| Configuration | High | Runtime obfuscation |
| Dependencies | Medium | Hashed chunk names |

## What This Does NOT Protect

- **Database schema** - Visible if someone accesses your database
- **API contracts** - Network requests can be inspected
- **Algorithms at runtime** - Determined attackers with debuggers
- **Open source dependencies** - These remain identifiable

## Deployment Recommendations

### For Maximum Protection:

1. **Environment Variables**
   ```bash
   # Add to Vercel environment variables
   OBFUSCATION_KEY=your-unique-32-char-random-string
   ```

2. **Enable Protected Build**
   ```bash
   # When ready for production
   cp next.config.protected.js next.config.js
   npm run build
   ```

3. **Git Ignore Sensitive Files**
   ```gitignore
   # Already in .gitignore but verify:
   .env.local
   .env.production.local
   ```

### Additional Measures (Optional):

1. **Legal Protection**
   - Add copyright notices to all files
   - Include license headers
   - Register trademarks

2. **Technical Measures**
   - Use Vercel's edge functions for sensitive logic
   - Implement API rate limiting (already done ✅)
   - Add request fingerprinting

3. **Monitoring**
   - Set up alerts for unusual API usage
   - Monitor for cloning attempts via Sentry

## Testing Protection

To verify obfuscation is working:

```bash
# Build with protection
npm run build

# Check output files in .next/static/chunks/
# Files should be named like: abc123def.js (not readable names)
# Content should be minified and unreadable
```

## Important Notes

1. **This is deterrence, not absolute security** - A determined attacker with resources can eventually reverse-engineer any client-side code.

2. **Your real moat** is:
   - Your doctoral research and expertise
   - Your professional credentials (DEdPsych, CPsychol)
   - First-mover advantage in the UK SEND EdTech space
   - Network effects once schools adopt the platform

3. **Trade secret vs patent** - This obfuscation approach treats your algorithms as trade secrets. If you later decide to patent, you'll need to disclose the algorithm (which is the opposite approach).

## Copyright Notice

Add this to the top of all source files:

```typescript
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * NOTICE: This software is the confidential and proprietary property of
 * EdPsych Connect Limited. Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 */
```

## Next Steps

1. ✅ `next.config.protected.js` created
2. ✅ `src/lib/secure-config.ts` created  
3. ✅ `src/lib/core-algorithms.ts` created
4. ⬜ Add OBFUSCATION_KEY to Vercel environment variables
5. ⬜ Test protected build locally
6. ⬜ Consider legal consultation for formal IP protection

---

*This protection strategy balances security with development convenience. For enterprise-grade protection, consider consulting with a cybersecurity firm specialising in software IP protection.*
