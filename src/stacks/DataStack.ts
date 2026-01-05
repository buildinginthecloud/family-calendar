import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as kms from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';

export class DataStack extends cdk.Stack {
  public readonly eventsTable: dynamodb.Table;
  public readonly configurationsTable: dynamodb.Table;
  public readonly encryptionKey: kms.Key;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // KMS key for encryption at rest
    this.encryptionKey = new kms.Key(this, 'EncryptionKey', {
      description: 'KMS key for Family Calendar data encryption',
      enableKeyRotation: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // DynamoDB table for calendar events
    this.eventsTable = new dynamodb.Table(this, 'EventsTable', {
      tableName: 'FamilyCalendarEvents',
      partitionKey: {
        name: 'familyMemberId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'eventId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: this.encryptionKey,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    // GSI for querying events by date range
    this.eventsTable.addGlobalSecondaryIndex({
      indexName: 'EventsByDateIndex',
      partitionKey: {
        name: 'familyMemberId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'startTime',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // DynamoDB table for calendar configurations
    this.configurationsTable = new dynamodb.Table(this, 'ConfigurationsTable', {
      tableName: 'FamilyCalendarConfigurations',
      partitionKey: {
        name: 'familyMemberId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: this.encryptionKey,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Outputs
    new cdk.CfnOutput(this, 'EventsTableName', {
      value: this.eventsTable.tableName,
      description: 'Events DynamoDB table name',
      exportName: 'FamilyCalendarEventsTableName',
    });

    new cdk.CfnOutput(this, 'ConfigurationsTableName', {
      value: this.configurationsTable.tableName,
      description: 'Configurations DynamoDB table name',
      exportName: 'FamilyCalendarConfigurationsTableName',
    });

    new cdk.CfnOutput(this, 'EncryptionKeyArn', {
      value: this.encryptionKey.keyArn,
      description: 'KMS encryption key ARN',
      exportName: 'FamilyCalendarEncryptionKeyArn',
    });
  }
}
