"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const projen_1 = require("projen");
const javascript_1 = require("projen/lib/javascript");
/**
 * Projen configuration for Family Calendar Display CDK Application
 *
 * This configuration follows CDK best practices documented in:
 * .kiro/steering/cdk-best-practices.md
 */
const project = new projen_1.awscdk.AwsCdkTypeScriptApp({
    // Project metadata
    name: 'family-calendar',
    description: 'Family Calendar Display for Samsung Frame TV',
    cdkVersion: '2.126.0',
    defaultReleaseBranch: 'main',
    packageManager: javascript_1.NodePackageManager.NPM,
    // Author info
    authorName: 'buildinginthecloud',
    authorEmail: '',
    // Node.js version requirement
    minNodeVersion: '20.0.0',
    // Application entry point
    appEntrypoint: 'app.ts',
    // TypeScript configuration - strict mode enabled per best practices
    tsconfig: {
        compilerOptions: {
            strict: true,
            noImplicitAny: true,
            strictNullChecks: true,
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
                '!src/**/handler/**',
            ],
            coverageDirectory: 'coverage',
            moduleNameMapper: {
                '^@constructs/(.*)$': '<rootDir>/src/constructs/$1',
                '^@stacks/(.*)$': '<rootDir>/src/stacks/$1',
                '^@frontend/(.*)$': '<rootDir>/src/frontend/$1',
            },
            setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
        },
    },
    // Prettier configuration
    prettier: true,
    // ESLint configuration
    eslint: true,
    // Dependencies - following CDK best practices
    deps: [
        'aws-cdk-lib@^2.126.0',
        'constructs@^10.3.0',
        'cdk-iam-floyd@^0.300.0', // Per CDK best practices for IAM policy generation
        'react@^18.2.0',
        'react-dom@^18.2.0',
        'fast-check@^3.15.1', // Property-based testing library
        '@aws-sdk/client-cognito-identity-provider@^3.515.0',
        '@aws-sdk/client-dynamodb@^3.515.0',
        '@aws-sdk/lib-dynamodb@^3.515.0',
    ],
    // Dev dependencies
    devDeps: [
        '@types/node@^20.11.16',
        '@types/react@^18.2.55',
        '@types/react-dom@^18.2.19',
        '@types/jest@^29.5.12',
        'ts-jest@^29.1.2',
        'ts-node@^10.9.2',
    ],
    // Build and development scripts following CDK best practices
    scripts: {
        'test:watch': 'jest --watch --silent',
        'test:coverage': 'jest --coverage --silent',
        'test:properties': 'jest --testPathPattern=properties --silent',
        'cdk:synth': 'cdk synth',
        'cdk:deploy': 'cdk deploy',
        'cdk:diff': 'cdk diff',
        'cdk:destroy': 'cdk destroy',
        'cdk:bootstrap': 'cdk bootstrap',
        'cdk:watch': 'cdk watch',
        'cdk:hotswap': 'cdk deploy --hotswap',
    },
    // Project structure
    srcdir: 'src',
    testdir: 'test',
    // Disable automatic releases and GitHub integration
    release: false,
    github: false,
    sampleCode: false,
    // Context for CDK (empty by default per best practices)
    context: {},
});
// Additional CDK tasks per best practices - tasks with 'cdk:' prefix
project.addTask('test:unit', {
    description: 'Run unit tests only (excluding property tests)',
    exec: 'jest --testPathIgnorePatterns=properties --silent',
});
project.synth();
