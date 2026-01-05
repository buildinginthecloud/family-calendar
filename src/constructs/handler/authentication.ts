import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';

/**
 * Authentication Lambda Handler
 * Implements dual validation: IP address verification + Cognito authentication
 * Requirement 3.3: Dual authentication validation
 * Property 4: Authentication Access Control
 */

interface AuthenticationRequest {
  accessToken?: string;
  requestIp?: string;
}

interface AuthenticationResponse {
  authorized: boolean;
  reason?: string;
  userId?: string;
  username?: string;
}

interface SecurityAuditLog {
  timestamp: string;
  ipAddress: string;
  userId?: string;
  username?: string;
  authMethod: string;
  result: 'success' | 'failure';
  reason?: string;
}

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const cognitoClient = new CognitoIdentityProviderClient({});

const CONFIGURATIONS_TABLE = process.env.CONFIGURATIONS_TABLE_NAME!;
const USER_POOL_ID = process.env.USER_POOL_ID!;

/**
 * Log security audit event
 * Requirement 3.4: Security audit logging for all authentication attempts
 * Property 5: Security Audit Logging
 */
function logSecurityAudit(auditLog: SecurityAuditLog): void {
  console.log(JSON.stringify({
    eventType: 'SECURITY_AUDIT',
    ...auditLog,
  }));
}

/**
 * Validate IP address against allowlist stored in DynamoDB
 * Requirement 3.2: IP-based access control
 */
async function validateIpAddress(ipAddress: string): Promise<boolean> {
  try {
    const response = await docClient.send(
      new GetCommand({
        TableName: CONFIGURATIONS_TABLE,
        Key: {
          familyMemberId: 'SYSTEM_CONFIG',
        },
      })
    );

    if (!response.Item) {
      console.log('No IP allowlist configuration found, defaulting to deny');
      return false;
    }

    const allowedIPs: string[] = response.Item.allowedIPs || [];
    const isAllowed = allowedIPs.includes(ipAddress);

    console.log('IP validation result', {
      ipAddress,
      isAllowed,
      allowedIPCount: allowedIPs.length,
    });

    return isAllowed;
  } catch (error) {
    console.error('Error validating IP address:', error);
    return false;
  }
}

/**
 * Validate Cognito access token
 * Requirement 3.3: Login authentication validation
 */
async function validateCognitoToken(accessToken: string): Promise<{
  valid: boolean;
  userId?: string;
  username?: string;
}> {
  try {
    const response = await cognitoClient.send(
      new GetUserCommand({
        AccessToken: accessToken,
      })
    );

    const username = response.Username;
    const userId = response.UserAttributes?.find((attr) => attr.Name === 'sub')?.Value;

    console.log('Cognito token validated successfully', {
      username,
      userId,
    });

    return {
      valid: true,
      userId,
      username,
    };
  } catch (error) {
    console.error('Cognito token validation failed:', error);
    return {
      valid: false,
    };
  }
}

/**
 * Main authentication handler
 * Implements dual validation: IP + Cognito
 * Requirement 3.3: Authentication with dual validation
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const sourceIp = event.requestContext.identity.sourceIp || 'unknown';
  const timestamp = new Date().toISOString();

  console.log('Authentication validation invoked', {
    sourceIp,
    timestamp,
    path: event.path,
  });

  try {
    // Parse request body
    const body: AuthenticationRequest = event.body ? JSON.parse(event.body) : {};
    const accessToken = body.accessToken || event.headers?.Authorization?.replace('Bearer ', '');

    // Step 1: Validate IP address
    const ipValid = await validateIpAddress(sourceIp);

    if (!ipValid) {
      // Requirement 3.4: Log unauthorized access attempt
      logSecurityAudit({
        timestamp,
        ipAddress: sourceIp,
        authMethod: 'ip-restriction',
        result: 'failure',
        reason: 'IP address not in allowlist',
      });

      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          authorized: false,
          reason: 'Access denied',
        } as AuthenticationResponse),
      };
    }

    // Step 2: Validate Cognito token if provided
    if (!accessToken) {
      // Requirement 3.4: Log incomplete authentication attempt
      logSecurityAudit({
        timestamp,
        ipAddress: sourceIp,
        authMethod: 'cognito',
        result: 'failure',
        reason: 'No access token provided',
      });

      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          authorized: false,
          reason: 'Authentication required',
        } as AuthenticationResponse),
      };
    }

    const cognitoValidation = await validateCognitoToken(accessToken);

    if (!cognitoValidation.valid) {
      // Requirement 3.4: Log failed Cognito validation
      logSecurityAudit({
        timestamp,
        ipAddress: sourceIp,
        authMethod: 'cognito',
        result: 'failure',
        reason: 'Invalid access token',
      });

      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          authorized: false,
          reason: 'Invalid credentials',
        } as AuthenticationResponse),
      };
    }

    // Both validations passed - successful authentication
    // Requirement 3.4: Log successful authentication
    logSecurityAudit({
      timestamp,
      ipAddress: sourceIp,
      userId: cognitoValidation.userId,
      username: cognitoValidation.username,
      authMethod: 'dual-validation',
      result: 'success',
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        authorized: true,
        userId: cognitoValidation.userId,
        username: cognitoValidation.username,
      } as AuthenticationResponse),
    };
  } catch (error) {
    console.error('Authentication error:', error);

    // Requirement 3.4: Log authentication system error
    logSecurityAudit({
      timestamp,
      ipAddress: sourceIp,
      authMethod: 'system',
      result: 'failure',
      reason: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        authorized: false,
        reason: 'Internal server error',
      } as AuthenticationResponse),
    };
  }
}
