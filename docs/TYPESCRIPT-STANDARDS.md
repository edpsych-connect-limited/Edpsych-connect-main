# Enterprise TypeScript Type Standards

## Overview

This document establishes the enterprise-grade TypeScript standards for the EdPsych Connect platform, ensuring type safety, maintainability, and code consistency across all service layers.

## Principles

1. **Explicit is better than implicit** - All types must be explicitly declared
2. **No implicit `any`** - Every parameter, variable, and return type must have a defined type
3. **Strict mode enabled** - All TypeScript strict mode rules are enforced
4. **Service layer enforcement** - Highest standards applied to `/src/lib/services/` directory

## Type Annotation Standards

### Function Parameters

All function parameters MUST have explicit type annotations:

```typescript
// ❌ WRONG - No type annotation
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ CORRECT - Explicit types
function calculateTotal(items: Array<{price: number}>): number {
  return items.reduce((sum: number, item) => sum + item.price, 0);
}
```

### Arrow Function Parameters in Callbacks

```typescript
// ❌ WRONG
data.forEach(item => {
  console.log(item.name);
});

// ✅ CORRECT
data.forEach((item: any) => {
  console.log(item.name);
});

// ✅ EVEN BETTER - Use specific types
interface DataItem {
  name: string;
}
data.forEach((item: DataItem) => {
  console.log(item.name);
});
```

### Object Initializations

All object literals that aren't immediately assigned to a typed variable must have explicit types:

```typescript
// ❌ WRONG - Type is inferred as never[]
const config = {
  items: [],
  count: 0
};

// ✅ CORRECT - Explicit type
const config: Record<string, any> = {
  items: [],
  count: 0
};

// ✅ BETTER - Specific type
interface Config {
  items: string[];
  count: number;
}
const config: Config = {
  items: [],
  count: 0
};
```

### Method Return Types

```typescript
// ❌ WRONG - Implicit return type
async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// ✅ CORRECT - Explicit return type
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}
```

## Service Layer Specific Standards

### Service Base Types

All services should leverage the base types from `@/types/service-base.types`:

```typescript
import { 
  ServiceConfig, 
  ServiceResponse, 
  HealthCheckResult 
} from '@/types/service-base.types';

class MyService {
  private config: ServiceConfig;

  async performOperation(): Promise<ServiceResponse<any>> {
    return {
      success: true,
      data: {},
      timestamp: new Date().toISOString()
    };
  }

  async healthCheck(): Promise<HealthCheckResult> {
    return {
      status: 'healthy',
      checks: { database: true, cache: true },
      timestamp: new Date().toISOString()
    };
  }
}
```

### Private Method Typing

```typescript
// All private methods MUST have explicit return types
private _analyzePatterns(events: any[]): Record<string, any> {
  const patterns: Record<string, any> = {};
  // implementation
  return patterns;
}
```

### Constructor and Initialization

```typescript
class ServiceExample {
  private config: ServiceConfig;
  private cache: Map<string, any>;

  constructor(options: ServiceConfig = {}) {
    this.config = {
      timeout: 5000,
      retryAttempts: 3,
      ...options
    };
    this.cache = new Map();
  }
}
```

## Common Type Patterns

### Generic Records
Use when you need flexible key-value storage:

```typescript
// For any string keys with any values
const data: Record<string, any> = {};

// For string keys with specific value types
const counters: Record<string, number> = {};

// For specific keys with different types
type Config = Record<'enabled' | 'timeout' | 'debug', string | number | boolean>;
```

### Array Types
```typescript
// Simple array
const items: string[] = [];

// Array of objects with types
const users: Array<{id: string; name: string}> = [];

// Array with generic type
const results: Array<any> = [];
```

### Optional Types
```typescript
// Optional parameter
function process(config?: ServiceConfig): void {}

// Optional property
interface User {
  name: string;
  email?: string;
}
```

## Enforcement

### Pre-commit Hook
Type checking is enforced at commit time via `.git/hooks/pre-commit`. This prevents non-typed code from entering the repository.

### CI/CD Pipeline
The build pipeline runs `npx tsc --noEmit` to verify all types before deployment.

### ESLint Rules
Service layer files are checked against strict ESLint rules in `.eslintrc.service-layer.json`.

## Migration Guide

For existing code, use this priority order:

1. **High Priority**: Function parameters and return types
2. **Medium Priority**: Object initializations in service methods
3. **Low Priority**: Local variables with clear type inference

## Tools and Commands

```bash
# Check for type issues
npm run type-check

# Enforce types in service layer
./tools/enforce-types.sh check

# Auto-fix common type issues
./tools/enforce-types.sh fix

# Run ESLint on service layer
npx eslint src/lib/services --config .eslintrc.service-layer.json
```

## References

- [TypeScript Handbook - Strict Mode](https://www.typescriptlang.org/docs/handbook/2/basic-types.html)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- Base types: `src/types/service-base.types.ts`
