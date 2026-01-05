import { awscdk } from 'projen';
import { NodePackageManager } from 'projen/lib/javascript';

/**
 * Projen configuration for Family Calendar Display CDK Application
 * 
 * This configuration follows CDK best practices documented in:
 * .kiro/steering/cdk-best-practices.md
 * 
 * Project structure:
 * - src/: Application code
 * - src/stacks/: CDK Stack definitions
 * - src/constructs/: Custom CDK Constructs
 * - src/stages/: CDK Stage definitions (if needed)
 * - test/: All test files including property-based tests
 */
const project = new awscdk.AwsCdkTypeScriptApp({
  // Project metadata
  name: 'family-calendar',
  description: 'Family Calendar Display for Samsung Frame TV',
  cdkVersion: '2.215.0', // Latest stable CDK version (as of Jan 2026)
  defaultReleaseBranch: 'main',
  packageManager: NodePackageManager.NPM,
  
  // Author and repository info
  authorName: 'buildinginthecloud',
  authorEmail: '',
  repository: 'https://github.com/buildinginthecloud/family-calendar.git',
  repositoryUrl: 'https://github.com/buildinginthecloud/family-calendar.git',
  
  // Node.js version requirement
  minNodeVersion: '20.0.0',
  
  // Application entry point
  appEntrypoint: 'app.ts',
  
  // TypeScript configuration - strict mode enabled per best practices
  tsconfig: {
    compilerOptions: {
      target: 'ES2020',
      lib: ['ES2020', 'DOM'],
      strict: true,
      noImplicitAny: true,
      strictNullChecks: true,
      noImplicitThis: true,
      alwaysStrict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
      strictPropertyInitialization: false,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      jsx: 'react',
      experimentalDecorators: true,
      baseUrl: '.',
      paths: {
        '@constructs/*': ['src/constructs/*'],
        '@stacks/*': ['src/stacks/*'],
        '@frontend/*': ['src/frontend/*'],
      },
    },
  },
  
  // Testing configuration
  jestOptions: {
    jestConfig: {
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['**/*.test.ts'],
      collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/handler/**', // Exclude Lambda handlers from coverage
      ],
      coverageDirectory: 'coverage',
      coverageReporters: ['text', 'lcov', 'html'],
      moduleNameMapper: {
        '^@constructs/(.*)$': '<rootDir>/src/constructs/$1',
        '^@stacks/(.*)$': '<rootDir>/src/stacks/$1',
        '^@frontend/(.*)$': '<rootDir>/src/frontend/$1',
      },
      globals: {
        'ts-jest': {
          tsconfig: {
            jsx: 'react',
          },
        },
      },
      // Setup file for property-based testing configuration
      setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
    },
  },
  
  // Prettier configuration for code formatting
  prettier: true,
  prettierOptions: {
    settings: {
      semi: true,
      singleQuote: true,
      trailingComma: 'es5',
      printWidth: 100,
      tabWidth: 2,
    },
  },
  
  // ESLint configuration for TypeScript
  eslint: true,
  eslintOptions: {
    prettier: true,
    dirs: ['src', 'test'],
  },
  
  // Git ignore patterns
  gitignore: [
    '*.js',
    '*.d.ts',
    'node_modules/',
    'cdk.out/',
    'lib/',
    '.DS_Store',
    '*.log',
    'coverage/',
    '.env',
    '.env.local',
    '*.swp',
    '*.swo',
    '*~',
  ],
  
  // Dependencies
  deps: [
    'aws-cdk-lib@^2.215.0',
    'constructs@^10.3.0',
    'cdk-iam-floyd@^0.2000.0', // Per CDK best practices for IAM policy generation
    'react@^18.2.0',
    'react-dom@^18.2.0',
    'fast-check@^3.15.1', // Property-based testing library
  ],
  
  // Dev dependencies
  devDeps: [
    '@types/node@^20.11.16',
    '@types/react@^18.2.55',
    '@types/react-dom@^18.2.19',
    '@types/jest@^29.5.12',
    'ts-jest@^29.1.2',
    'ts-node@^10.9.2',
    'eslint-plugin-react@^7.33.2',
    'eslint-plugin-react-hooks@^4.6.0',
  ],
  
  // Build and development scripts
  scripts: {
    'test:watch': 'jest --watch --silent',
    'test:coverage': 'jest --coverage --silent',
    'test:properties': 'jest --testPathPattern=properties --silent',
    'cdk:synth': 'cdk synth',
    'cdk:deploy': 'cdk deploy',
    'cdk:diff': 'cdk diff',
    'cdk:destroy': 'cdk destroy',
    'format': 'prettier --write "src/**/*.{ts,tsx}" "test/**/*.{ts,tsx}"',
    'format:check': 'prettier --check "src/**/*.{ts,tsx}" "test/**/*.{ts,tsx}"',
  },
  
  // Disable automatic releases
  release: false,
  
  // GitHub integration (optional)
  github: false,
  
  // Sample code generation
  sampleCode: false,
  
  // Project structure
  srcdir: 'src',
  testdir: 'test',
  
  // Context for CDK (empty by default per best practices)
  context: {},
});

// Additional project tasks per CDK best practices
// CDK apps should have tasks with 'cdk:' prefix
project.addTask('cdk:bootstrap', {
  description: 'Bootstrap CDK toolkit stack into AWS environment',
  exec: 'cdk bootstrap',
});

project.addTask('cdk:watch', {
  description: 'Watch for changes and deploy automatically',
  exec: 'cdk watch',
});

project.addTask('cdk:hotswap', {
  description: 'Deploy with hotswap for faster development iterations',
  exec: 'cdk deploy --hotswap',
});

project.addTask('test:unit', {
  description: 'Run unit tests only (excluding property tests)',
  exec: 'jest --testPathIgnorePatterns=properties --silent',
});

// Add .projen to gitignore to avoid committing projen files
project.gitignore.addPatterns('.projen/');

// Ensure test setup file exists for fast-check configuration
project.postCompileTask.exec('mkdir -p test');

project.synth();
