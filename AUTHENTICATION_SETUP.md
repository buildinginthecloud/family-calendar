# Authentication and Security Setup

This document describes the comprehensive authentication and security layer implemented for the Family Calendar Display application.

## Overview

The application implements a multi-layered security approach combining:
- **AWS Cognito User Pool**: User authentication and authorization
- **AWS WAF (Web Application Firewall)**: IP-based access control and DDoS protection
- **Dual Validation**: Both IP address verification and Cognito token validation
- **Security Audit Logging**: Comprehensive logging of all authentication attempts

## Architecture Components

### 1. AWS Cognito User Pool (Requirement 3.1)

**Configuration:**
- Self-sign-up disabled (admin-managed accounts)
- Email and username sign-in
- Email verification enabled
- Strong password policy (12+ chars, mixed case, digits, symbols)
- Optional MFA (SMS and TOTP)
- OAuth 2.0 flows with required scopes (email, openid, profile)
- Token validity: 24 hours (access/id), 30 days (refresh)

**Usage:**
```bash
# Create a user
aws cognito-idp admin-create-user \
  --user-pool-id <USER_POOL_ID> \
  --username john.doe@example.com \
  --user-attributes Name=email,Value=john.doe@example.com \
  --temporary-password TempPassword123!

# Set permanent password
aws cognito-idp admin-set-user-password \
  --user-pool-id <USER_POOL_ID> \
  --username john.doe@example.com \
  --password SecurePassword123! \
  --permanent
```

### 2. AWS WAF Web ACL (Requirement 3.2)

**Features:**
- IP allowlist (optional) - only specified IPs can access CloudFront distribution
- Rate limiting (2000 requests per 5 minutes per IP)
- AWS Managed Rules for common web exploits
- CloudWatch metrics and sampling enabled

**Configuration:**
The WAF can be deployed with or without IP restrictions:

```bash
# Deploy with IP allowlist
npx cdk deploy --context allowedIPs='["1.2.3.4/32","5.6.7.8/32"]'

# Deploy without IP restrictions (allow all)
npx cdk deploy
```

### 3. AuthenticationService Lambda (Requirement 3.3)

**Dual Validation Process:**

1. **IP Validation**
   - Extracts source IP from API Gateway request context
   - Queries DynamoDB for IP allowlist configuration
   - Denies access if IP not in allowlist

2. **Cognito Token Validation**
   - Extracts Bearer token from Authorization header
   - Validates token with Cognito using GetUser API
   - Verifies token is active and not expired
   - Retrieves user details (userId, username)

3. **Authorization Decision**
   - Access granted only if BOTH validations pass
   - Returns appropriate HTTP status codes (200, 401, 403, 500)

**API Endpoint:**
```
POST /auth/validate
Headers:
  Authorization: Bearer <cognito-access-token>
Body: {
  "accessToken": "<cognito-access-token>"
}

Response:
{
  "authorized": true,
  "userId": "uuid",
  "username": "john.doe@example.com"
}
```

### 4. Security Audit Logging (Requirement 3.4)

**Logged Events:**
- All authentication attempts (success/failure)
- IP address of requester
- User ID and username (if authenticated)
- Authentication method (ip-restriction, cognito, dual-validation)
- Timestamp (ISO 8601 format)
- Failure reason (if applicable)

**Log Format:**
```json
{
  "eventType": "SECURITY_AUDIT",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "ipAddress": "1.2.3.4",
  "userId": "uuid",
  "username": "john.doe@example.com",
  "authMethod": "dual-validation",
  "result": "success"
}
```

**Viewing Logs:**
```bash
# View authentication logs
aws logs tail /aws/lambda/FamilyCalendar-Authentication --follow

# Filter for failed attempts
aws logs filter-log-events \
  --log-group-name /aws/lambda/FamilyCalendar-Authentication \
  --filter-pattern '{ $.result = "failure" }'
```

## IP Allowlist Management

### DynamoDB Storage

IP allowlist is stored in the Configurations table:

```json
{
  "familyMemberId": "SYSTEM_CONFIG",
  "allowedIPs": ["1.2.3.4", "5.6.7.8"],
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Management API

**Get current allowlist:**
```bash
curl -X GET https://api.example.com/auth/ip-allowlist \
  -H "Authorization: Bearer <cognito-token>"
```

**Update allowlist:**
```bash
curl -X POST https://api.example.com/auth/ip-allowlist \
  -H "Authorization: Bearer <cognito-token>" \
  -H "Content-Type: application/json" \
  -d '{"allowedIPs": ["1.2.3.4", "5.6.7.8", "9.10.11.12"]}'
```

### Initial Configuration

Set initial IPs during deployment:

```bash
# Using CDK context
npx cdk deploy --all \
  --context allowedIPs='["192.168.1.100","192.168.1.101"]'
```

Or update the DynamoDB table directly:

```bash
aws dynamodb put-item \
  --table-name FamilyCalendarConfigurations \
  --item '{
    "familyMemberId": {"S": "SYSTEM_CONFIG"},
    "allowedIPs": {"L": [
      {"S": "192.168.1.100"},
      {"S": "192.168.1.101"}
    ]},
    "updatedAt": {"S": "2024-01-15T10:30:00.000Z"}
  }'
```

## Property-Based Tests

### Property 4: Authentication Access Control

Validates that authentication correctly implements dual validation:
- IP address must be in allowlist
- Cognito token must be valid
- Access granted only when BOTH conditions are met

**Test Coverage:** 100+ iterations testing various combinations of:
- Valid/invalid IP addresses
- Valid/invalid/missing tokens
- Edge cases and error conditions

### Property 5: Security Audit Logging

Validates that all authentication attempts are logged:
- Every attempt produces a log entry
- Required fields present (timestamp, IP, result)
- Failed attempts include reason
- Successful attempts include user details
- No sensitive information exposure

**Test Coverage:** 100+ iterations with various:
- Successful authentications
- Failed authentications (different reasons)
- Edge cases (missing data, system errors)

## CloudFront Integration

The WAF Web ACL is automatically attached to the CloudFront distribution:

```typescript
// In FrontendStack
this.distribution = new cloudfront.Distribution(this, 'Distribution', {
  // ... other config
  webAclId: authStack.webAcl.attrArn, // WAF integration
});
```

## Security Best Practices

✅ **Implemented:**
- No hardcoded secrets or credentials
- Encrypted data at rest (KMS)
- TLS 1.2+ for all communications
- Least privilege IAM policies
- Audit logging enabled
- Rate limiting configured
- Password complexity enforced
- MFA available (optional)

⚠️ **Operational Security:**
- Rotate access tokens regularly
- Monitor CloudWatch logs for suspicious activity
- Review IP allowlist periodically
- Enable MFA for administrative users
- Keep user list minimal (family members only)
- Use strong, unique passwords

## Troubleshooting

### Authentication Failures

**403 Forbidden - IP not allowed:**
```
Solution: Add IP to allowlist via API or DynamoDB
Check current IP: curl https://ifconfig.me
```

**401 Unauthorized - Invalid token:**
```
Solution: Refresh Cognito access token
Token expired: Request new token using refresh token
Invalid token: Re-authenticate with username/password
```

**500 Internal Server Error:**
```
Solution: Check CloudWatch logs for Lambda function errors
Common issues: DynamoDB permissions, Cognito configuration
```

### WAF Blocking Legitimate Traffic

Check WAF metrics in CloudWatch:
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/WAFV2 \
  --metric-name BlockedRequests \
  --dimensions Name=WebACL,Value=FamilyCalendarWebACL \
  --start-time 2024-01-15T00:00:00Z \
  --end-time 2024-01-15T23:59:59Z \
  --period 3600 \
  --statistics Sum
```

Review blocked requests:
```bash
aws wafv2 get-sampled-requests \
  --web-acl-arn <WEB_ACL_ARN> \
  --rule-metric-name AllowedIPsRule \
  --scope CLOUDFRONT \
  --time-window StartTime=2024-01-15T00:00:00Z,EndTime=2024-01-15T23:59:59Z
```

## Deployment

Deploy all stacks in order:

```bash
# 1. Deploy data stack (DynamoDB, KMS)
npx cdk deploy FamilyCalendarDataStack

# 2. Deploy auth stack (Cognito, WAF)
npx cdk deploy FamilyCalendarAuthStack \
  --context allowedIPs='["YOUR_IP"]'

# 3. Deploy backend stack (API, Lambda)
npx cdk deploy FamilyCalendarBackendStack \
  --context allowedIPs='["YOUR_IP"]'

# 4. Deploy frontend stack (CloudFront, S3)
npx cdk deploy FamilyCalendarFrontendStack

# Or deploy all at once
npx cdk deploy --all \
  --context allowedIPs='["YOUR_IP"]'
```

## References

- Design Document: `.kiro/specs/family-calendar-display/design.md`
- Requirements: `.kiro/specs/family-calendar-display/requirements.md`
- AWS Cognito Documentation: https://docs.aws.amazon.com/cognito/
- AWS WAF Documentation: https://docs.aws.amazon.com/waf/
- CDK Best Practices: `.kiro/steering/cdk-best-practices.md`
