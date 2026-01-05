import {
  CloudFormationCustomResourceEvent,
  CloudFormationCustomResourceResponse,
} from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';

/**
 * IP Allowlist Manager Lambda Handler
 * Manages IP allowlist configuration in DynamoDB
 * Used as a custom resource and for runtime management
 * Requirement 3.2: IP-based access control configuration
 */

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const CONFIGURATIONS_TABLE = process.env.CONFIGURATIONS_TABLE_NAME!;
const SYSTEM_CONFIG_KEY = 'SYSTEM_CONFIG';

interface IpAllowlistConfig {
  familyMemberId: string;
  allowedIPs: string[];
  updatedAt: string;
}

/**
 * Initialize or update IP allowlist in DynamoDB
 */
async function updateIpAllowlist(allowedIPs: string[]): Promise<void> {
  const config: IpAllowlistConfig = {
    familyMemberId: SYSTEM_CONFIG_KEY,
    allowedIPs,
    updatedAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: CONFIGURATIONS_TABLE,
      Item: config,
    })
  );

  console.log('IP allowlist updated successfully', {
    allowedIPCount: allowedIPs.length,
  });
}

/**
 * Get current IP allowlist from DynamoDB
 */
async function getIpAllowlist(): Promise<string[]> {
  const response = await docClient.send(
    new GetCommand({
      TableName: CONFIGURATIONS_TABLE,
      Key: {
        familyMemberId: SYSTEM_CONFIG_KEY,
      },
    })
  );

  return response.Item?.allowedIPs || [];
}

/**
 * Add IP to allowlist
 */
async function _addIpToAllowlist(ipAddress: string): Promise<void> {
  const currentIPs = await getIpAllowlist();

  if (!currentIPs.includes(ipAddress)) {
    currentIPs.push(ipAddress);
    await updateIpAllowlist(currentIPs);
    console.log('IP added to allowlist', { ipAddress });
  } else {
    console.log('IP already in allowlist', { ipAddress });
  }
}

/**
 * Remove IP from allowlist
 */
async function _removeIpFromAllowlist(ipAddress: string): Promise<void> {
  const currentIPs = await getIpAllowlist();
  const updatedIPs = currentIPs.filter((ip) => ip !== ipAddress);

  if (updatedIPs.length !== currentIPs.length) {
    await updateIpAllowlist(updatedIPs);
    console.log('IP removed from allowlist', { ipAddress });
  } else {
    console.log('IP not found in allowlist', { ipAddress });
  }
}

/**
 * Handle CloudFormation custom resource events
 */
export async function handler(
  event: CloudFormationCustomResourceEvent
): Promise<CloudFormationCustomResourceResponse> {
  console.log('IP Allowlist Manager invoked', {
    requestType: event.RequestType,
    properties: event.ResourceProperties,
  });

  try {
    const allowedIPs = (event.ResourceProperties.allowedIPs as string[]) || [];

    switch (event.RequestType) {
      case 'Create':
      case 'Update':
        await updateIpAllowlist(allowedIPs);
        break;

      case 'Delete':
        // Don't delete the allowlist on stack deletion for safety
        console.log('Stack deletion - preserving IP allowlist configuration');
        break;
    }

    return {
      Status: 'SUCCESS',
      PhysicalResourceId: 'IpAllowlistConfig',
      StackId: event.StackId,
      RequestId: event.RequestId,
      LogicalResourceId: event.LogicalResourceId,
      Data: {
        AllowedIPCount: allowedIPs.length,
      },
    };
  } catch (error) {
    console.error('Error managing IP allowlist:', error);

    return {
      Status: 'FAILED',
      Reason: error instanceof Error ? error.message : 'Unknown error',
      PhysicalResourceId: 'IpAllowlistConfig',
      StackId: event.StackId,
      RequestId: event.RequestId,
      LogicalResourceId: event.LogicalResourceId,
    };
  }
}
