import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import { Construct } from 'constructs';

export interface AuthStackProps extends cdk.StackProps {
  readonly allowedIPs?: string[];
}

/**
 * AuthStack
 * Implements authentication and security layer
 * Requirements 3.1, 3.2, 3.3: User pool, IP restriction, authentication flows
 */
export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly webAcl: wafv2.CfnWebACL;

  constructor(scope: Construct, id: string, props?: AuthStackProps) {
    super(scope, id, props);

    // Requirement 3.1: Cognito User Pool for family authentication
    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'FamilyCalendarUserPool',
      selfSignUpEnabled: false, // Admin creates family member accounts
      signInAliases: {
        email: true,
        username: true,
      },
      autoVerify: {
        email: true,
      },
      // Requirement 3.1: Strong password policy
      passwordPolicy: {
        minLength: 12,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      // Requirement 3.1: Optional MFA for enhanced security
      mfa: cognito.Mfa.OPTIONAL,
      mfaSecondFactor: {
        sms: true,
        otp: true,
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Requirement 3.1, 3.3: User Pool Client with required OAuth scopes
    this.userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool: this.userPool,
      userPoolClientName: 'FamilyCalendarWebClient',
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      generateSecret: false,
      preventUserExistenceErrors: true,
      accessTokenValidity: cdk.Duration.hours(24),
      idTokenValidity: cdk.Duration.hours(24),
      refreshTokenValidity: cdk.Duration.days(30),
      // Requirement 3.3: OAuth scopes for authentication
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
      },
    });

    // Build WAF rules array
    const wafRules: wafv2.CfnWebACL.RuleProperty[] = [];

    // Requirement 3.2: IP-based access control (if IPs provided)
    if (props?.allowedIPs && props.allowedIPs.length > 0) {
      // Create IP set for allowed IPs
      const ipSet = new wafv2.CfnIPSet(this, 'AllowedIPSet', {
        name: 'FamilyCalendarAllowedIPs',
        scope: 'CLOUDFRONT',
        ipAddressVersion: 'IPV4',
        addresses: props.allowedIPs,
      });

      wafRules.push({
        name: 'AllowedIPsRule',
        priority: 0,
        action: {
          allow: {},
        },
        statement: {
          ipSetReferenceStatement: {
            arn: ipSet.attrArn,
          },
        },
        visibilityConfig: {
          sampledRequestsEnabled: true,
          cloudWatchMetricsEnabled: true,
          metricName: 'AllowedIPsRule',
        },
      });
    }

    // Rate limiting rule
    wafRules.push({
      name: 'RateLimitRule',
      priority: 1,
      action: {
        block: {},
      },
      statement: {
        rateBasedStatement: {
          limit: 2000,
          aggregateKeyType: 'IP',
        },
      },
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'RateLimitRule',
      },
    });

    // AWS Managed Rules for common attacks
    wafRules.push({
      name: 'AWSManagedRulesCommonRuleSet',
      priority: 2,
      overrideAction: {
        none: {},
      },
      statement: {
        managedRuleGroupStatement: {
          vendorName: 'AWS',
          name: 'AWSManagedRulesCommonRuleSet',
        },
      },
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'AWSManagedRulesCommonRuleSet',
      },
    });

    // Requirement 3.2: WAF Web ACL for CloudFront
    this.webAcl = new wafv2.CfnWebACL(this, 'WebACL', {
      name: 'FamilyCalendarWebACL',
      scope: 'CLOUDFRONT',
      defaultAction: props?.allowedIPs && props.allowedIPs.length > 0
        ? { block: {} } // Block by default if IP allowlist is configured
        : { allow: {} }, // Allow by default if no IP restriction
      rules: wafRules,
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'FamilyCalendarWebACL',
      },
    });

    // Outputs
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: 'FamilyCalendarUserPoolId',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
      exportName: 'FamilyCalendarUserPoolClientId',
    });

    new cdk.CfnOutput(this, 'WebACLArn', {
      value: this.webAcl.attrArn,
      description: 'WAF Web ACL ARN for CloudFront',
      exportName: 'FamilyCalendarWebACLArn',
    });
  }
}
