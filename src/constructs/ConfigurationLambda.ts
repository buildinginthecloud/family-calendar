import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import * as path from 'path';

export interface ConfigurationLambdaProps {
  readonly configurationsTable: dynamodb.Table;
  readonly encryptionKey: kms.Key;
}

export class ConfigurationLambda extends Construct {
  public readonly function: nodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: ConfigurationLambdaProps) {
    super(scope, id);

    // Lambda function
    this.function = new nodejs.NodejsFunction(this, 'Function', {
      functionName: 'FamilyCalendar-Configuration',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, 'handler', 'configuration.ts'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
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
    props.configurationsTable.grantReadWriteData(this.function);
    props.encryptionKey.grantEncryptDecrypt(this.function);

    // Grant Secrets Manager access
    this.function.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'secretsmanager:CreateSecret',
          'secretsmanager:GetSecretValue',
          'secretsmanager:PutSecretValue',
          'secretsmanager:DescribeSecret',
          'secretsmanager:UpdateSecret',
        ],
        resources: [
          `arn:aws:secretsmanager:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:secret:family-calendar/*`,
        ],
      })
    );
  }
}
