# Project Structure

**Project Management**: This project uses [Projen](https://projen.io/) for project initialization and file management, following CDK best practices. All project configuration is managed through `.projenrc.ts`.

```
family-calendar/
│
├── .projenrc.ts                        # Projen configuration (EDIT THIS)
├── .projenrc.js                        # Compiled Projen config (generated)
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
│   │   ├── IpAllowlistManager.ts       # IP management construct
│   │   │
│   │   └── handler/                    # Lambda Function Code
│   │       ├── calendar-sync.ts        # Calendar sync logic
│   │       ├── authentication.ts       # Auth validation logic
│   │       ├── configuration.ts        # Config CRUD logic
│   │       ├── events.ts               # Events query logic
│   │       └── ip-allowlist-manager.ts # IP management logic
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
├── docs/                               # Documentation
│   ├── QUICKSTART.md                   # Quick start guide
│   ├── SETUP_INSTRUCTIONS.md           # Detailed setup guide
│   ├── PROJECT_STRUCTURE.md            # File organization (this file)
│   ├── AUTHENTICATION_SETUP.md         # Authentication guide
│   └── IMPLEMENTATION_SUMMARY.md       # Implementation status
│
├── Configuration Files (Projen-managed)
│   ├── package.json                    # Dependencies & scripts (generated)
│   ├── tsconfig.json                   # TypeScript config (generated)
│   ├── tsconfig.dev.json               # Dev TypeScript config (generated)
│   ├── cdk.json                        # CDK config (generated)
│   ├── .eslintrc.json                  # ESLint config (generated)
│   ├── .prettierrc.json                # Prettier config (generated)
│   ├── .prettierignore                 # Prettier ignore (generated)
│   ├── .npmignore                      # NPM ignore (generated)
│   ├── .gitignore                      # Git ignore rules (generated)
│   ├── .gitattributes                  # Git attributes (generated)
│   └── LICENSE                         # License file (generated)
│
├── Documentation
│   ├── README.md                       # Main documentation
│   └── docs/                           # Detailed documentation
│       ├── PROJECT_STRUCTURE.md        # This file
│       ├── SETUP_INSTRUCTIONS.md       # Setup guide
│       ├── QUICKSTART.md               # Quick start guide
│       ├── AUTHENTICATION_SETUP.md     # Authentication guide
│       └── IMPLEMENTATION_SUMMARY.md   # Implementation summary
│
└── Generated (not in repo)
    ├── .projen/                        # Projen metadata
    ├── node_modules/                   # Dependencies
    ├── lib/                            # Compiled JavaScript
    ├── cdk.out/                        # CDK synthesis output
    ├── coverage/                       # Test coverage reports
    └── test-reports/                   # Test result reports
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

**⚠️ IMPORTANT**: The following files are managed by Projen and should NOT be edited manually:

| File | Purpose | Managed By |
|------|---------|------------|
| `package.json` | Project metadata, dependencies, and npm scripts | Projen |
| `tsconfig.json` | TypeScript compiler configuration (strict mode) | Projen |
| `tsconfig.dev.json` | Development TypeScript configuration | Projen |
| `cdk.json` | CDK app configuration and feature flags | Projen |
| `.eslintrc.json` | ESLint code quality rules | Projen |
| `.prettierrc.json` | Code formatting rules | Projen |
| `.prettierignore` | Files excluded from Prettier formatting | Projen |
| `.npmignore` | Files excluded from NPM package | Projen |
| `.gitignore` | Files excluded from version control | Projen |
| `.gitattributes` | Git file attributes | Projen |
| `LICENSE` | Project license | Projen |

**To modify these files**: Edit `.projenrc.ts` and run `npm run projen`

**Manually editable files**:
- `.projenrc.ts` - Projen configuration
- All files in `src/` - Source code
- All files in `test/` - Test code
- Documentation files (README.md, etc.)

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

## Projen Workflow

```
Edit .projenrc.ts
  → Run `npm run projen`
    → Regenerates configuration files
      → Run `npm install` (if dependencies changed)
        → Continue development
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
