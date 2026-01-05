import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as path from 'path';

export interface AuthenticationLambdaProps {
  readonly userPool: cognito.UserPool;
  readonly configurationsTable: dynamodb.Table;
}

/**
 * AuthenticationLambda Construct
 * Implements dual authentication: IP validation + Cognito token verification
 * Requirements 3.2, 3.3, 3.4: IP restriction, login authentication, audit logging
 */
export class AuthenticationLambda extends Construct {
  public readonly function: nodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: AuthenticationLambdaProps) {
    super(scope, id);

    // Lambda function for authentication service
    this.function = new nodejs.NodejsFunction(this, 'Function', {
      functionName: 'FamilyCalendar-Authentication',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, 'handler', 'authentication.ts'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        USER_POOL_ID: props.userPool.userPoolId,
        CONFIGURATIONS_TABLE_NAME: props.configurationsTable.tableName,
      },
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'es2020',
        externalModules: ['@aws-sdk/*'],
      },
      logRetention: logs.RetentionDays.ONE_MONTH,
    });

    // Grant read access to configurations table for IP allowlist
    props.configurationsTable.grantReadData(this.function);

    // Grant Cognito permissions for token validation
    this.function.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['cognito-idp:GetUser', 'cognito-idp:DescribeUserPool'],
        resources: [props.userPool.userPoolArn],
      })
    );

    // Grant CloudWatch Logs permissions for security audit logging
    this.function.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
        resources: ['*'],
      })
    );
  }
}
