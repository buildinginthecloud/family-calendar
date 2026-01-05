# Family Calendar Display

A serverless web application for displaying aggregated calendar events from multiple sources (iCloud and Outlook) on Samsung Frame TV, built with AWS CDK and TypeScript.

## 📋 Project Overview

The Family Calendar Display aggregates calendar events from multiple family members' iCloud and Outlook calendars into a unified, TV-optimized interface. The application uses AWS serverless architecture with secure authentication and automatic synchronization.

## 🏗️ Architecture

- **Frontend**: React/TypeScript SPA hosted on S3 + CloudFront
- **Backend**: API Gateway + Lambda functions
- **Data Layer**: DynamoDB for events and configurations
- **Authentication**: AWS Cognito + WAF for IP-based access control
- **Integration**: iCloud CalDAV and Microsoft Graph API

## 📁 Project Structure

```
family-calendar/
├── src/
│   ├── app.ts                          # Main CDK application
│   ├── stacks/                         # CDK stack definitions
│   │   ├── DataStack.ts                # DynamoDB and KMS
│   │   ├── AuthStack.ts                # Cognito and WAF
│   │   ├── BackendStack.ts             # API Gateway and Lambda
│   │   └── FrontendStack.ts            # CloudFront and S3
│   ├── constructs/                     # CDK constructs
│   │   ├── CalendarSyncLambda.ts
│   │   ├── AuthenticationLambda.ts
│   │   ├── ConfigurationLambda.ts
│   │   ├── EventsLambda.ts
│   │   ├── IpAllowlistManager.ts
│   │   └── handler/                    # Lambda function code
│   │       ├── authentication.ts       # Dual auth validation
│   │       ├── ip-allowlist-manager.ts # IP management
│   │       ├── calendar-sync.ts
│   │       ├── configuration.ts
│   │       └── events.ts
│   └── frontend/                       # React components
│       ├── components/
│       │   ├── CalendarDisplay.tsx
│       │   ├── EventCard.tsx
│       │   ├── AuthenticationWrapper.tsx
│       │   ├── ConfigurationPanel.tsx
│       │   └── ArtModeView.tsx
│       └── types/
│           └── models.ts               # TypeScript type definitions
├── test/                               # Test files
│   ├── stacks/                         # Stack tests
│   ├── constructs/                     # Construct tests
│   ├── frontend/                       # Frontend component tests
│   ├── properties/                     # Property-based tests
│   └── setup.ts                        # Test configuration
├── package.json
├── tsconfig.json
├── cdk.json                            # CDK configuration
├── jest.config.js                      # Jest configuration
├── .eslintrc.js                        # ESLint configuration
├── AUTHENTICATION_SETUP.md             # Authentication documentation
└── README.md                           # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.0.0
- AWS CLI configured with appropriate credentials
- AWS CDK CLI installed globally

### Installation

1. **Clone the repository**:
   ```bash
   cd /projects/sandbox/family-calendar
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

### Configuration

The project follows CDK best practices as documented in `.kiro/steering/cdk-best-practices.md`:

- All source code in `src/` directory
- Stacks in `src/stacks/`
- Constructs in `src/constructs/`
- Lambda handlers in construct subdirectories
- Pascal-casing for filenames
- TypeScript strict mode enabled

## 📦 Available Scripts

### Development

- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch mode for development
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier

### Testing

- `npm test` - Run all tests (silent mode)
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report

**Testing Framework**: The project uses Jest for unit tests and fast-check for property-based testing. Property-based tests are configured to run a minimum of 100 iterations as specified in the design document.

### CDK Commands

- `npm run cdk:synth` - Synthesize CloudFormation templates
- `npm run cdk:deploy` - Deploy stacks to AWS
- `npm run cdk:diff` - Compare deployed stack with current state
- `npm run cdk:destroy` - Remove stacks from AWS

## 🧪 Testing Strategy

### Unit Testing

Unit tests verify specific functionality of individual components:

```bash
npm test -- test/stacks/
```

### Property-Based Testing

Property-based tests validate universal correctness properties using fast-check:

```bash
npm test -- test/properties/
```

Each property test is tagged with its design document reference:
```typescript
/**
 * **Feature: family-calendar-display, Property 2: Event Aggregation Consistency**
 */
test('Property 2: Event aggregation maintains all events without duplication', () => {
  // Test implementation with minimum 100 iterations
});
```

### Test Configuration

- Minimum 100 iterations per property test (configured in `test/setup.ts`)
- Tests run in silent mode to prevent session timeouts
- Coverage reports generated in `coverage/` directory

## 🔒 Security Best Practices

Following `.kiro/steering/security-best-practices.md`:

- ✅ No hardcoded secrets (use Secrets Manager)
- ✅ Environment variables for configuration
- ✅ Encrypted data at rest (KMS)
- ✅ HTTPS/TLS 1.3 for all communications
- ✅ Least privilege IAM policies
- ✅ WAF rules for rate limiting and common attacks
- ✅ Cognito for user authentication
- ✅ Dual validation (IP + Cognito token)
- ✅ Security audit logging enabled
- ✅ Optional MFA for enhanced security

For detailed authentication setup and configuration, see [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md).

## 📐 TypeScript Configuration

TypeScript is configured with strict mode enabled (`tsconfig.json`):

- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- `noImplicitReturns: true`
- Path aliases for clean imports (`@constructs`, `@stacks`, `@frontend`)

## 🎨 Code Quality

### ESLint

The project uses ESLint with TypeScript-specific rules:

- TypeScript recommended rules
- React and React Hooks rules
- Explicit return types required
- No `any` types allowed
- Naming conventions enforced

### Formatting

Prettier is configured for consistent code formatting:

```bash
npm run format
```

## 📊 Deployment

### Development Environment

```bash
# Synthesize CloudFormation templates
npm run cdk:synth

# Deploy all stacks
npm run cdk:deploy -- --all

# Deploy specific stack
npm run cdk:deploy -- FamilyCalendarDataStack
```

### Production Deployment

1. Ensure AWS credentials are configured for production account
2. Review changes with `npm run cdk:diff`
3. Deploy with approval: `npm run cdk:deploy -- --all --require-approval broadening`
4. Verify deployment in AWS Console

### Stack Dependencies

Stacks are deployed in order based on dependencies:
1. DataStack (DynamoDB, KMS)
2. AuthStack (Cognito, WAF)
3. BackendStack (API Gateway, Lambda) - depends on DataStack and AuthStack
4. FrontendStack (CloudFront, S3) - depends on BackendStack

## 🔧 Configuration Management

### Environment Variables

Lambda functions use environment variables for configuration:
- `EVENTS_TABLE_NAME`
- `CONFIGURATIONS_TABLE_NAME`
- `ENCRYPTION_KEY_ID`
- `USER_POOL_ID`

### Secrets Management

Calendar credentials are stored in AWS Secrets Manager:
- Secret naming pattern: `family-calendar/{family-member-id}/{source}`
- Encrypted with KMS
- Accessed by Lambda functions with appropriate IAM permissions

## 📝 Development Guidelines

### Adding New Stacks

1. Create stack file in `src/stacks/` with PascalCase naming
2. Implement stack class extending `cdk.Stack`
3. Add stack instantiation in `src/app.ts`
4. Create corresponding test in `test/stacks/`

### Adding New Constructs

1. Create construct file in `src/constructs/`
2. Save constructor props as private field
3. Create resources in protected methods
4. Pass concrete resource objects, not identifiers
5. Create handler directory with Lambda code
6. Add construct tests

### Adding New Lambda Functions

1. Use `NodejsFunction` for TypeScript handlers
2. Place handler code in construct's `handler/` subdirectory
3. Configure bundling with source maps
4. Set appropriate timeout and memory
5. Grant necessary IAM permissions

## 🎯 Design Properties

The application implements 16 correctness properties as defined in the design document:

1. Calendar Source Integration
2. Event Aggregation Consistency
3. Graceful Degradation on Source Failure
4. Authentication Access Control
5. Security Audit Logging
6. Complete Event Information Display
7. Event Type Visual Differentiation
8. Recurring Event Expansion
9. Family Member Event Distinction
10. TV Display Accessibility Standards
11. Non-Overlapping Event Layout
12. Responsive Grid Layout
13. Configuration Validation and Persistence
14. Real-time Configuration Updates
15. Samsung Frame TV Optimization
16. Ambient Display Adaptation

Each property is validated through property-based tests in `test/properties/`.

## 📚 Additional Documentation

- **Authentication Setup**: `AUTHENTICATION_SETUP.md` - Comprehensive guide to authentication and security
- Design Document: `.kiro/specs/family-calendar-display/design.md`
- Requirements: `.kiro/specs/family-calendar-display/requirements.md`
- Tasks: `.kiro/specs/family-calendar-display/tasks.md`
- CDK Best Practices: `.kiro/steering/cdk-best-practices.md`
- TypeScript Best Practices: `.kiro/steering/typescript-best-practices.md`
- Testing Best Practices: `.kiro/steering/testing-best-practices.md`

## 🤝 Contributing

1. Follow existing code conventions and patterns
2. Write tests for new functionality
3. Run linting and formatting before committing
4. Update documentation as needed
5. Follow commit message conventions

## 📄 License

MIT

## 🆘 Troubleshooting

### Build Errors

```bash
# Clean build artifacts
rm -rf lib/ cdk.out/

# Reinstall dependencies
rm -rf node_modules/
npm install

# Rebuild
npm run build
```

### Test Failures

```bash
# Run specific test file
npm test -- test/stacks/DataStack.test.ts

# Run with verbose output
npm test -- --verbose

# Update snapshots
npm test -- -u
```

### Deployment Issues

```bash
# Bootstrap CDK (first time only)
npx cdk bootstrap

# Check differences
npm run cdk:diff

# Deploy with verbose logging
npm run cdk:deploy -- --all --verbose
```

## 📞 Support

For issues or questions, refer to:
- Design documentation in `.kiro/specs/`
- Best practices in `.kiro/steering/`
- AWS CDK documentation: https://docs.aws.amazon.com/cdk/
