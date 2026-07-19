```markdown
# voltagent Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `voltagent` TypeScript codebase. It covers file naming, import/export styles, commit message patterns, and testing conventions. While no frameworks or automated workflows are detected, this guide ensures consistency and clarity for contributors.

## Coding Conventions

### File Naming
- Use **kebab-case** for all file names.
  - Example:  
    ```
    user-service.ts
    data-model.test.ts
    ```

### Import Style
- Use **relative imports** throughout the codebase.
  - Example:
    ```typescript
    import { fetchData } from './utils/fetch-data';
    ```

### Export Style
- Prefer **named exports** over default exports.
  - Example:
    ```typescript
    // In user-service.ts
    export function getUser(id: string) { ... }

    // In another file
    import { getUser } from './user-service';
    ```

### Commit Message Patterns
- Commit types are mixed, with prefixes like `docs` and `example`.
- Average commit message length is 67 characters.
  - Example:
    ```
    docs: update README with installation instructions
    example: add usage example for fetchData
    ```

## Workflows

_No automated workflows detected in this repository._

## Testing Patterns

- **Test files** follow the `*.test.*` naming pattern.
  - Example:
    ```
    user-service.test.ts
    ```
- **Testing framework** is unknown; check existing test files for patterns.
- Place tests alongside implementation or in a dedicated test directory, following the naming pattern.

  Example test file:
  ```typescript
  // user-service.test.ts
  import { getUser } from './user-service';

  describe('getUser', () => {
    it('returns user data for a valid ID', () => {
      // test implementation
    });
  });
  ```

## Commands

| Command         | Purpose                                      |
|-----------------|----------------------------------------------|
| /test           | Run all test files matching *.test.*         |
| /lint           | Lint the codebase for style consistency      |
| /docs-update    | Update documentation files                   |
| /example-update | Add or update usage examples                 |
```
