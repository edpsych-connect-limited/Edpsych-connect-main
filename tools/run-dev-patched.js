// Load the filesystem patch first
require('../scripts/patch-fs-runtime.cjs');

// Then load the Next.js CLI
// We need to set the arguments correctly because Next.js CLI reads process.argv
// The original argv would be [node, run-dev-patched.js, dev, -p, 3002]
// Next.js expects [node, next, dev, -p, 3002]
// But usually it just parses from index 2.

// Let's just require the binary. It should execute immediately.
require('../node_modules/next/dist/bin/next');
