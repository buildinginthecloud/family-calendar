import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import * as path from 'path';

export interface EventsLambdaProps {
  readonly eventsTable: dynamodb.Table;
}

export class EventsLambda extends Construct {
  public readonly function: nodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: EventsLambdaProps) {
    super(scope, id);

    // Lambda function
    this.function = new nodejs.NodejsFunction(this, 'Function', {
      functionName: 'FamilyCalendar-Events',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, 'handler', 'events.ts'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        EVENTS_TABLE_NAME: props.eventsTable.tableName,
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
    props.eventsTable.grantReadData(this.function);
  }
}
