// Next.js server-only wrapper around the script registry.
//
// Keep client bundles clean: this module should never be imported from client components.

import 'server-only';

export * from './registry-core';
