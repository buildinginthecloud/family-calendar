import { Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import { DataStack } from '../../src/stacks/DataStack';

describe('DataStack', () => {
  let app: cdk.App;
  let stack: DataStack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new DataStack(app, 'TestDataStack');
    template = Template.fromStack(stack);
  });

  test('creates DynamoDB tables', () => {
    template.resourceCountIs('AWS::DynamoDB::Table', 2);
  });

  test('creates events table with correct configuration', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'FamilyCalendarEvents',
      BillingMode: 'PAY_PER_REQUEST',
      PointInTimeRecoverySpecification: {
        PointInTimeRecoveryEnabled: true,
      },
    });
  });

  test('creates configurations table with correct configuration', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'FamilyCalendarConfigurations',
      BillingMode: 'PAY_PER_REQUEST',
    });
  });

  test('creates KMS key with rotation enabled', () => {
    template.hasResourceProperties('AWS::KMS::Key', {
      EnableKeyRotation: true,
    });
  });

  test('events table has GSI for date queries', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      GlobalSecondaryIndexes: [
        {
          IndexName: 'EventsByDateIndex',
        },
      ],
    });
  });

  test('tables use customer-managed encryption', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      SSESpecification: {
        SSEEnabled: true,
        SSEType: 'KMS',
      },
    });
  });
});
