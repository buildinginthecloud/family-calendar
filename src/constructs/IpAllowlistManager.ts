import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as customResources from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import * as path from 'path';

export interface IpAllowlistManagerProps {
  readonly configurationsTable: dynamodb.Table;
  readonly initialAllowedIPs?: string[];
}

/**
 * IpAllowlistManager Construct
 * Manages IP allowlist configuration in DynamoDB
 * Requirement 3.2: IP-based access control configuration
 */
export class IpAllowlistManager extends Construct {
  public readonly function: nodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: IpAllowlistManagerProps) {
    super(scope, id);

    // Lambda function for managing IP allowlist
    this.function = new nodejs.NodejsFunction(this, 'Function', {
      functionName: 'FamilyCalendar-IpAllowlistManager',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, 'handler', 'ip-allowlist-manager.ts'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
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

    // Grant read/write access to configurations table
    props.configurationsTable.grantReadWriteData(this.function);

    // Custom resource to initialize IP allowlist if provided
    if (props.initialAllowedIPs && props.initialAllowedIPs.length > 0) {
      const provider = new customResources.Provider(this, 'IpAllowlistProvider', {
        onEventHandler: this.function,
      });

      new cdk.CustomResource(this, 'IpAllowlistResource', {
        serviceToken: provider.serviceToken,
        properties: {
          allowedIPs: props.initialAllowedIPs,
        },
      });
    }
  }
}
