# Project Structure

```
family-calendar/
│
├── bin/
│   └── family-calendar.js              # CDK CLI entry point
│
├── src/
│   ├── app.ts                          # Main CDK application
│   │
│   ├── stacks/                         # CDK Stack Definitions
│   │   ├── DataStack.ts                # DynamoDB & KMS
│   │   ├── AuthStack.ts                # Cognito & WAF
│   │   ├── BackendStack.ts             # API Gateway & Lambda
│   │   └── FrontendStack.ts            # CloudFront & S3
│   │
│   ├── constructs/                     # CDK Constructs
│   │   ├── CalendarSyncLambda.ts       # Calendar sync orchestration
│   │   ├── AuthenticationLambda.ts     # Authentication handler
│   │   ├── ConfigurationLambda.ts      # Configuration management
│   │   ├── EventsLambda.ts             # Events API handler
│   │   │
│   │   └── handler/                    # Lambda Function Code
│   │       ├── calendar-sync.ts        # Calendar sync logic
│   │       ├── authentication.ts       # Auth validation logic
│   │       ├── configuration.ts        # Config CRUD logic
│   │       └── events.ts               # Events query logic
│   │
│   └── frontend/                       # React Frontend
│       ├── components/                 # React Components
│       │   ├── CalendarDisplay.tsx     # Main calendar grid
│       │   ├── EventCard.tsx           # Event display card
│       │   ├── AuthenticationWrapper.tsx
│       │   ├── ConfigurationPanel.tsx  # Admin panel
│       │   └── ArtModeView.tsx         # TV Art Mode overlay
│       │
│       └── types/                      # TypeScript Types
│           └── models.ts               # Data models
│
├── test/                               # Test Files
│   ├── stacks/                         # Stack Tests
│   │   └── DataStack.test.ts
│   │
│   ├── constructs/                     # Construct Tests
│   │
│   ├── frontend/                       # Component Tests
│   │
│   ├── properties/                     # Property-Based Tests
│   │   └── calendar-properties.test.ts
│   │
│   └── setup.ts                        # Test configuration
│
├── Configuration Files
│   ├── package.json                    # Dependencies & scripts
│   ├── tsconfig.json                   # TypeScript config
│   ├── cdk.json                        # CDK config
│   ├── jest.config.js                  # Jest config
│   ├── .eslintrc.js                    # ESLint config
│   ├── .prettierrc                     # Prettier config
│   └── .gitignore                      # Git ignore rules
│
├── Documentation
│   ├── README.md                       # Main documentation
│   └── PROJECT_STRUCTURE.md            # This file
│
└── Generated (not in repo)
    ├── node_modules/                   # Dependencies
    ├── lib/                            # Compiled JavaScript
    ├── cdk.out/                        # CDK synthesis output
    └── coverage/                       # Test coverage reports
```

## Directory Purposes

### `/bin`
Contains the CDK CLI entry point script that executes the compiled CDK app.

### `/src`
Main source code directory containing all TypeScript code.

#### `/src/stacks`
CDK stack definitions that compose AWS resources:
- **DataStack**: DynamoDB tables and KMS encryption
- **AuthStack**: Cognito user pools and WAF rules
- **BackendStack**: API Gateway and Lambda integrations
- **FrontendStack**: CloudFront distribution and S3 bucket

#### `/src/constructs`
Reusable CDK constructs for Lambda functions:
- Each construct encapsulates a Lambda function with its IAM permissions
- Follows CDK best practices (props as private field, concrete resource objects)

#### `/src/constructs/handler`
Lambda function implementation code:
- TypeScript handlers for each Lambda function
- Business logic for API operations
- Integration with AWS services (DynamoDB, Secrets Manager)

#### `/src/frontend`
React application code:
- **components/**: React components optimized for TV display
- **types/**: TypeScript type definitions and data models

### `/test`
Test files organized by type:
- **stacks/**: CDK stack snapshot and assertion tests
- **constructs/**: Construct unit tests
- **frontend/**: React component tests
- **properties/**: Property-based tests using fast-check
- **setup.ts**: Global test configuration (100+ iterations)

## File Naming Conventions

- **Stacks**: PascalCase ending in `Stack.ts` (e.g., `DataStack.ts`)
- **Constructs**: PascalCase ending in `Lambda.ts` (e.g., `CalendarSyncLambda.ts`)
- **Components**: PascalCase `.tsx` files (e.g., `EventCard.tsx`)
- **Handlers**: kebab-case `.ts` files (e.g., `calendar-sync.ts`)
- **Tests**: Match source file name with `.test.ts` suffix

## Key Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Project metadata, dependencies, and npm scripts |
| `tsconfig.json` | TypeScript compiler configuration (strict mode) |
| `cdk.json` | CDK app configuration and feature flags |
| `jest.config.js` | Jest test framework configuration |
| `.eslintrc.js` | ESLint code quality rules |
| `.prettierrc` | Code formatting rules |
| `.gitignore` | Files excluded from version control |

## Import Path Aliases

TypeScript path aliases for cleaner imports:
- `@constructs/*` → `src/constructs/*`
- `@stacks/*` → `src/stacks/*`
- `@frontend/*` → `src/frontend/*`

Example:
```typescript
import { DataStack } from '@stacks/DataStack';
import { CalendarEvent } from '@frontend/types/models';
```

## Build Output

Generated directories (not committed to git):
- `lib/` - Compiled JavaScript from TypeScript
- `cdk.out/` - CloudFormation templates from CDK synthesis
- `coverage/` - Test coverage reports from Jest
- `node_modules/` - Installed npm dependencies

## CDK App Flow

```
bin/family-calendar.js
  → lib/app.js (compiled from src/app.ts)
    → Instantiates Stacks
      → Stacks use Constructs
        → Constructs create AWS Resources
          → CDK synthesizes CloudFormation
```

## Testing Flow

```
npm test
  → Jest with ts-jest
    → Loads test/setup.ts (configures fast-check)
      → Runs unit tests (test/stacks/, test/constructs/)
      → Runs property tests (test/properties/)
        → Each property test runs 100+ iterations
```
