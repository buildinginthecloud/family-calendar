# Family Calendar - Setup Instructions

## Projen-Based Project Setup

This project is managed by [projen](https://projen.io/), which provides a structured way to manage project configuration through code.

## Prerequisites

- **Node.js**: >= 20.0.0
- **npm**: Comes with Node.js
- **AWS CLI**: Configured with appropriate credentials
- **Git**: For version control

## Initial Setup

### 1. Install Dependencies

```bash
# The project uses projen to manage configuration
# First, run projen to generate/update all configuration files
npx projen

# This will:
# - Generate package.json with all dependencies
# - Create/update TypeScript configuration
# - Set up Jest, ESLint, and Prettier
# - Install all npm dependencies automatically
```

### 2. Verify Installation

```bash
# Check Node.js version
node --version  # Should be >= 20.0.0

# Check that dependencies are installed
npm list --depth=0

# Verify TypeScript compilation
npm run build
```

### 3. Run Tests

```bash
# Run all tests (unit + property-based)
npm test

# Run only unit tests
npm run test:unit

# Run only property-based tests (100 iterations each)
npm run test:properties

# Run tests with coverage
npm run test:coverage
```

## Project Configuration

### Projen Configuration File
The entire project configuration is defined in `.projenrc.ts`. This file controls:

- TypeScript compiler options (strict mode enabled)
- Jest testing configuration
- ESLint and Prettier settings
- CDK version and dependencies
- NPM scripts and tasks
- Build and deployment settings

### Making Configuration Changes

**⚠️ IMPORTANT**: Do NOT manually edit these files:
- `package.json`
- `tsconfig.json`
- `jest.config.js`
- `.eslintrc.js`
- `.prettierrc`
- `.gitignore`

Instead:
1. Edit `.projenrc.ts` with your desired changes
2. Run `npx projen` to regenerate configuration files
3. Commit both `.projenrc.ts` and the regenerated files

## Development Workflow

### Building the Project

```bash
# Compile TypeScript
npm run build

# Watch mode (auto-compile on changes)
npm run watch
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Auto-fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting without changes
npm run format:check
```

### CDK Operations

```bash
# Bootstrap CDK (first time only per account/region)
npm run cdk:bootstrap

# Synthesize CloudFormation templates
npm run cdk:synth

# Show what will change
npm run cdk:diff

# Deploy all stacks
npm run cdk:deploy

# Deploy specific stack
npm run cdk:deploy FamilyCalendarDataStack

# Destroy all stacks
npm run cdk:destroy

# Watch and auto-deploy (development)
npm run cdk:watch

# Hot-swap deployment (faster for Lambda changes)
npm run cdk:hotswap
```

## Testing Strategy

This project implements a dual testing approach:

### Unit Tests
Located in `test/stacks/`, `test/constructs/`, `test/frontend/`

- Test specific examples and edge cases
- Validate component behavior
- Use snapshot testing for CDK stacks

### Property-Based Tests
Located in `test/properties/`

- Test universal properties that should hold for all inputs
- Run with minimum 100 iterations (configured in `test/setup.ts`)
- Validate correctness properties from design document
- Use fast-check library for random input generation

**Fast-Check Configuration**:
The `test/setup.ts` file configures fast-check globally:
```typescript
fc.configureGlobal({
  numRuns: 100,      // Minimum 100 iterations per property test
  verbose: false     // Minimize output to avoid timeouts
});
```

## Project Structure

```
family-calendar/
├── .projenrc.ts              # Projen configuration (EDIT THIS)
├── src/                      # Source code
│   ├── app.ts                # Main CDK application
│   ├── stacks/               # CDK stack definitions
│   ├── constructs/           # Custom CDK constructs
│   │   └── handler/          # Lambda function code
│   └── frontend/             # React components
├── test/                     # Test files
│   ├── setup.ts              # Test configuration (fast-check)
│   ├── stacks/               # Stack tests
│   ├── constructs/           # Construct tests
│   ├── frontend/             # Frontend tests
│   └── properties/           # Property-based tests
└── bin/                      # CLI entry point
```

## Deployment Guide

### 1. Configure AWS Credentials

```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, Region
```

### 2. Bootstrap CDK (First Time Only)

```bash
npm run cdk:bootstrap
```

This creates the necessary S3 bucket and IAM roles for CDK deployments.

### 3. Review Changes

```bash
npm run cdk:diff
```

This shows what will be created/modified/deleted.

### 4. Deploy

```bash
# Deploy all stacks
npm run cdk:deploy

# Or deploy with auto-approval (CI/CD)
npm run cdk:deploy -- --all --require-approval never
```

### 5. Verify Deployment

Check the AWS Console or use AWS CLI:
```bash
aws cloudformation describe-stacks --stack-name FamilyCalendarDataStack
```

## Troubleshooting

### Projen Issues

```bash
# If projen fails, try clearing cache
rm -rf node_modules/ package-lock.json
npx projen
```

### Build Errors

```bash
# Clean build artifacts
rm -rf lib/ cdk.out/

# Rebuild
npm run build
```

### Test Failures

```bash
# Run specific test file
npm test -- test/stacks/DataStack.test.ts

# Run tests with verbose output
npm test -- --verbose

# Update snapshots (if tests changed intentionally)
npm test -- -u
```

### CDK Deployment Issues

```bash
# Check CDK version
npx cdk --version

# Re-bootstrap if needed
npm run cdk:bootstrap

# Deploy with verbose logging
npm run cdk:deploy -- --verbose
```

## Best Practices

### CDK Development
- Follow patterns in `.kiro/steering/cdk-best-practices.md`
- Place Lambda handlers in construct subdirectories (`handler/`)
- Use `NodejsFunction` for TypeScript Lambda functions
- Import resources in stacks, not constructs
- Use template literal types for resource identifiers

### TypeScript Development
- Strict mode is enabled - follow type safety practices
- Use path aliases (@constructs/*, @stacks/*, @frontend/*)
- Define return types for all functions
- Avoid `any` type (ESLint will error)
- Use meaningful variable and function names

### Testing
- Write unit tests for specific scenarios
- Write property tests for universal behaviors
- Run tests before committing: `npm test`
- Maintain high coverage: `npm run test:coverage`
- Keep tests fast and focused

## Additional Resources

- **Design Document**: `.kiro/specs/family-calendar-display/design.md`
- **CDK Best Practices**: `.kiro/steering/cdk-best-practices.md`
- **TypeScript Best Practices**: `.kiro/steering/typescript-best-practices.md`
- **Testing Best Practices**: `.kiro/steering/testing-best-practices.md`
- **Projen Documentation**: https://projen.io/
- **AWS CDK Documentation**: https://docs.aws.amazon.com/cdk/

## Support

For questions or issues:
1. Check the design document in `.kiro/specs/`
2. Review best practices in `.kiro/steering/`
3. Consult AWS CDK documentation
4. Review projen documentation for configuration questions

---

**Note**: This project is configured with projen. Always run `npx projen` after modifying `.projenrc.ts` to regenerate configuration files.
