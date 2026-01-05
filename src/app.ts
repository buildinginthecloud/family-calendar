#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FrontendStack } from './stacks/FrontendStack';
import { BackendStack } from './stacks/BackendStack';
import { AuthStack } from './stacks/AuthStack';
import { DataStack } from './stacks/DataStack';

const app = new cdk.App();

// Environment configuration
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

// Tags for all resources
const tags = {
  Project: 'FamilyCalendar',
  ManagedBy: 'CDK',
};

// Optional: Configure allowed IP addresses for WAF (can be set via context)
const allowedIPs = app.node.tryGetContext('allowedIPs') as string[] | undefined;

// Data Stack - DynamoDB, Secrets Manager
const dataStack = new DataStack(app, 'FamilyCalendarDataStack', {
  env,
  description: 'Data layer for Family Calendar Display - DynamoDB and Secrets Manager',
});

// Auth Stack - Cognito, WAF
const authStack = new AuthStack(app, 'FamilyCalendarAuthStack', {
  env,
  description: 'Authentication layer for Family Calendar Display - Cognito and WAF',
  allowedIPs,
});

// Backend Stack - API Gateway, Lambda
const backendStack = new BackendStack(app, 'FamilyCalendarBackendStack', {
  env,
  description: 'Backend API layer for Family Calendar Display - API Gateway and Lambda',
  dataStack,
  authStack,
  initialAllowedIPs: allowedIPs,
});

// Frontend Stack - CloudFront, S3 with WAF integration
const frontendStack = new FrontendStack(app, 'FamilyCalendarFrontendStack', {
  env,
  description: 'Frontend layer for Family Calendar Display - CloudFront and S3',
  apiEndpoint: backendStack.apiEndpoint,
  webAclArn: authStack.webAcl.attrArn,
});

// Apply tags to all stacks
Object.entries(tags).forEach(([key, value]) => {
  cdk.Tags.of(dataStack).add(key, value);
  cdk.Tags.of(authStack).add(key, value);
  cdk.Tags.of(backendStack).add(key, value);
  cdk.Tags.of(frontendStack).add(key, value);
});

app.synth();
