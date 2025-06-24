# Testing Strategy

This directory contains tests for the BossRecruitV2 server application. Tests are written using [Vitest](https://vitest.dev/).

## Directory Structure

Tests are organized by module type:

```
__tests__/
├── utils/          # Tests for utility functions
├── middleware/     # Tests for Express middleware
├── routes/         # Tests for API routes
└── db/             # Tests for database interactions
```

## Running Tests

You can run tests using the following npm commands:

```bash
# Run all tests
npm test

# Run a specific test file
npm run test:file -- __tests__/utils/jwt-utils.test.js

# Run tests with coverage report
npm run test:coverage
```

## Testing Approach

Each test file follows these principles:

1. **Unit tests**: Testing individual functions in isolation
2. **Mocking**: External dependencies are mocked to ensure tests are reliable
3. **Integration tests**: Some files include integration tests to verify complete functionality

## Writing Tests

When writing tests:

- Group related tests with `describe` blocks
- Each test should focus on one specific behavior
- Use descriptive test names that explain expected behavior
- Mock external dependencies like databases and APIs
- Include both success and error cases
