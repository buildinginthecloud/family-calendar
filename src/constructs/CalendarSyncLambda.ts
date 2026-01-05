import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import * as path from 'path';

export interface CalendarSyncLambdaProps {
  readonly eventsTable: dynamodb.Table;
  readonly configurationsTable: dynamodb.Table;
  readonly encryptionKey: kms.Key;
}

export class CalendarSyncLambda extends Construct {
  public readonly function: nodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: CalendarSyncLambdaProps) {
    super(scope, id);

    // Lambda function
    this.function = new nodejs.NodejsFunction(this, 'Function', {
      functionName: 'FamilyCalendar-CalendarSync',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, 'handler', 'calendar-sync.ts'),
      timeout: cdk.Duration.minutes(5),
      memorySize: 512,
      environment: {
        EVENTS_TABLE_NAME: props.eventsTable.tableName,
        CONFIGURATIONS_TABLE_NAME: props.configurationsTable.tableName,
        ENCRYPTION_KEY_ID: props.encryptionKey.keyId,
      },
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'es2020',
        externalModules: ['aws-sdk'],
      },
      logRetention: logs.RetentionDays.ONE_MONTH,
    });

    // Grant permissions
    props.eventsTable.grantReadWriteData(this.function);
    props.configurationsTable.grantReadData(this.function);
    props.encryptionKey.grantEncryptDecrypt(this.function);

    // Grant Secrets Manager access for calendar credentials
    this.function.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['secretsmanager:GetSecretValue', 'secretsmanager:DescribeSecret'],
        resources: [
          `arn:aws:secretsmanager:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:secret:family-calendar/*`,
        ],
      })
    );
  }
}
