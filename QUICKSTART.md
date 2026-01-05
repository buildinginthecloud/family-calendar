# Quick Start Guide

## Prerequisites Installation

Before you can use this project, ensure you have the following installed:

1. **Node.js (version 20 or higher)**
   ```bash
   # Check if Node.js is installed
   node --version
   
   # If not installed, install Node.js 20+
   # On macOS with Homebrew:
   brew install node@20
   
   # On Ubuntu/Debian:
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **AWS CLI (configured with credentials)**
   ```bash
   # Check if AWS CLI is installed
   aws --version
   
   # Configure AWS credentials
   aws configure
   ```

## First-Time Setup

```bash
# 1. Navigate to project directory
cd /projects/sandbox/family-calendar

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Run tests to verify setup
npm test

# 5. Synthesize CDK (generate CloudFormation)
npm run cdk:synth

# 6. Bootstrap AWS account (first time only)
npx cdk bootstrap

# 7. Deploy all stacks
npm run cdk:deploy -- --all
```

## Daily Development Workflow

```bash
# Start development with watch mode
npm run watch

# In another terminal, run tests in watch mode
npm run test:watch

# Lint your code
npm run lint

# Format your code
npm run format

# When ready to deploy changes
npm run build
npm run cdk:diff  # Review changes
npm run cdk:deploy -- --all
```

## Common Commands

### Building
```bash
npm run build       # Compile TypeScript
npm run watch       # Compile on file changes
```

### Testing
```bash
npm test                    # Run all tests (silent)
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Generate coverage report
npm test -- --verbose       # Run with verbose output
npm test -- test/stacks/    # Run specific test directory
```

### Linting & Formatting
```bash
npm run lint        # Check code quality
npm run lint:fix    # Fix auto-fixable issues
npm run format      # Format code with Prettier
```

### CDK Operations
```bash
npm run cdk:synth      # Generate CloudFormation templates
npm run cdk:diff       # Compare with deployed stack
npm run cdk:deploy     # Deploy all stacks
npm run cdk:destroy    # Remove all stacks (be careful!)

# Deploy specific stack
npm run cdk:deploy -- FamilyCalendarDataStack

# Deploy with approval
npm run cdk:deploy -- --all --require-approval broadening
```

## Project Structure Quick Reference

```
src/
  app.ts              # Main CDK app
  stacks/             # Infrastructure definitions
  constructs/         # Reusable components
    handler/          # Lambda function code
  frontend/           # React components
    components/       # UI components
    types/            # TypeScript types

test/
  stacks/             # Stack unit tests
  constructs/         # Construct unit tests
  properties/         # Property-based tests
  setup.ts            # Test configuration
```

## Troubleshooting

### "npm: command not found"
Node.js is not installed. Follow the Node.js installation steps above.

### "Cannot find module" errors after pulling
```bash
rm -rf node_modules/
npm install
npm run build
```

### CDK deployment fails
```bash
# Ensure AWS credentials are configured
aws sts get-caller-identity

# Bootstrap if needed
npx cdk bootstrap

# Check for differences
npm run cdk:diff
```

### TypeScript compilation errors
```bash
# Clean and rebuild
rm -rf lib/
npm run build
```

### Test failures
```bash
# Run specific test file
npm test -- test/stacks/DataStack.test.ts

# Run with verbose output
npm test -- --verbose

# Update snapshots if needed
npm test -- -u
```

## Next Steps

1. **Implement Business Logic**: Fill in the TODOs in Lambda handlers
2. **Add More Tests**: Create tests for constructs and frontend components
3. **Configure Secrets**: Set up calendar credentials in AWS Secrets Manager
4. **Build Frontend**: Implement React components with actual calendar logic
5. **Add CI/CD**: Set up GitHub Actions or AWS CodePipeline

## Resources

- [Project README](README.md) - Comprehensive documentation
- [Project Structure](PROJECT_STRUCTURE.md) - Detailed file organization
- [Design Document](.kiro/specs/family-calendar-display/design.md)
- [CDK Best Practices](.kiro/steering/cdk-best-practices.md)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)

## Getting Help

1. Check the [README.md](README.md) for detailed documentation
2. Review best practices in `.kiro/steering/` directory
3. Consult the design document in `.kiro/specs/family-calendar-display/`
4. Check AWS CDK documentation for specific AWS service questions
