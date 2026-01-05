import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { DataStack } from './DataStack';
import { AuthStack } from './AuthStack';
import { CalendarSyncLambda } from '../constructs/CalendarSyncLambda';
import { AuthenticationLambda } from '../constructs/AuthenticationLambda';
import { ConfigurationLambda } from '../constructs/ConfigurationLambda';
import { EventsLambda } from '../constructs/EventsLambda';
import { IpAllowlistManager } from '../constructs/IpAllowlistManager';

export interface BackendStackProps extends cdk.StackProps {
  readonly dataStack: DataStack;
  readonly authStack: AuthStack;
  readonly initialAllowedIPs?: string[];
}

/**
 * BackendStack
 * Implements API Gateway and Lambda functions for backend services
 * Integrates authentication service with IP allowlist management
 */
export class BackendStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;
  public readonly apiEndpoint: string;

  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    // API Gateway access logs
    const logGroup = new logs.LogGroup(this, 'ApiAccessLogs', {
      logGroupName: '/aws/apigateway/family-calendar',
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // REST API
    this.api = new apigateway.RestApi(this, 'FamilyCalendarApi', {
      restApiName: 'FamilyCalendarAPI',
      description: 'API for Family Calendar Display application',
      deployOptions: {
        stageName: 'prod',
        throttlingBurstLimit: 500,
        throttlingRateLimit: 1000,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        metricsEnabled: true,
        accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
        accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields(),
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
      },
    });

    // Cognito authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      cognitoUserPools: [props.authStack.userPool],
      authorizerName: 'FamilyCalendarAuthorizer',
      identitySource: 'method.request.header.Authorization',
    });

    // IP Allowlist Manager - for managing allowed IPs in DynamoDB
    const ipAllowlistManager = new IpAllowlistManager(this, 'IpAllowlistManager', {
      configurationsTable: props.dataStack.configurationsTable,
      initialAllowedIPs: props.initialAllowedIPs,
    });

    // Lambda constructs
    const calendarSyncLambda = new CalendarSyncLambda(this, 'CalendarSyncLambda', {
      eventsTable: props.dataStack.eventsTable,
      configurationsTable: props.dataStack.configurationsTable,
      encryptionKey: props.dataStack.encryptionKey,
    });

    const authenticationLambda = new AuthenticationLambda(this, 'AuthenticationLambda', {
      userPool: props.authStack.userPool,
      configurationsTable: props.dataStack.configurationsTable,
    });

    const configurationLambda = new ConfigurationLambda(this, 'ConfigurationLambda', {
      configurationsTable: props.dataStack.configurationsTable,
      encryptionKey: props.dataStack.encryptionKey,
    });

    const eventsLambda = new EventsLambda(this, 'EventsLambda', {
      eventsTable: props.dataStack.eventsTable,
    });

    // API Resources and methods
    const eventsResource = this.api.root.addResource('events');
    eventsResource.addMethod('GET', new apigateway.LambdaIntegration(eventsLambda.function), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    const configResource = this.api.root.addResource('config');
    configResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(configurationLambda.function),
      {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );
    configResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(configurationLambda.function),
      {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );
    configResource.addMethod(
      'PUT',
      new apigateway.LambdaIntegration(configurationLambda.function),
      {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    const syncResource = this.api.root.addResource('sync');
    syncResource.addMethod('POST', new apigateway.LambdaIntegration(calendarSyncLambda.function), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // Authentication endpoints (no Cognito authorizer for initial authentication)
    const authResource = this.api.root.addResource('auth');
    const validateResource = authResource.addResource('validate');
    validateResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(authenticationLambda.function)
    );

    // IP allowlist management endpoints (requires Cognito authorization)
    const ipResource = authResource.addResource('ip-allowlist');
    ipResource.addMethod('GET', new apigateway.LambdaIntegration(ipAllowlistManager.function), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
    ipResource.addMethod('POST', new apigateway.LambdaIntegration(ipAllowlistManager.function), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    this.apiEndpoint = this.api.url;

    // Outputs
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: this.apiEndpoint,
      description: 'API Gateway endpoint URL',
      exportName: 'FamilyCalendarApiEndpoint',
    });

    new cdk.CfnOutput(this, 'ApiId', {
      value: this.api.restApiId,
      description: 'API Gateway REST API ID',
      exportName: 'FamilyCalendarApiId',
    });
  }
}
