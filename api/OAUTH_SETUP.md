# OAuth/OpenID Connect Setup Guide

This guide explains how to configure OAuth/OpenID Connect authentication for the CDS Connect Authoring Tool.

## Overview

The application now supports three authentication methods:
1. **LDAP** - Traditional LDAP authentication
2. **Local** - Username/password stored in local configuration
3. **OAuth/OpenID Connect** - Modern OAuth 2.0/OpenID Connect authentication

All three methods can be enabled simultaneously, allowing users to choose their preferred authentication method.

## OAuth Configuration

### 1. Environment Variables

Set the following environment variables to configure OAuth:

```bash
# Enable OAuth authentication
AUTH_OAUTH_ACTIVE=true

# OAuth provider configuration
AUTH_OAUTH_CLIENT_ID=your-client-id
AUTH_OAUTH_CLIENT_SECRET=your-client-secret
AUTH_OAUTH_ISSUER_URL=https://your-oauth-provider.com

# Optional: Override default URLs if your provider uses different endpoints
AUTH_OAUTH_AUTHORIZATION_URL=https://your-oauth-provider.com/oauth/authorize
AUTH_OAUTH_TOKEN_URL=https://your-oauth-provider.com/oauth/token
AUTH_OAUTH_USER_INFO_URL=https://your-oauth-provider.com/oauth/userinfo

# OAuth scope (space-separated)
AUTH_OAUTH_SCOPE=openid profile email

# Callback URL (should match what you configure in your OAuth provider)
AUTH_OAUTH_CALLBACK_URL=http://localhost:3001/authoring/api/auth/oauth/callback
```

### 2. Configuration File

Alternatively, you can create a configuration file at `api/config/local.json`:

```json
{
  "auth": {
    "oauth": {
      "active": true,
      "clientID": "your-client-id",
      "clientSecret": "your-client-secret",
      "issuerURL": "https://your-oauth-provider.com",
      "scope": "openid profile email",
      "callbackURL": "http://localhost:3001/authoring/api/auth/oauth/callback"
    }
  }
}
```

## OAuth Provider Setup

### Keycloak Running Locally

We've provided configuration files in /keycloak for local development. You can run Keycloak like so:

```sh
docker run -it --name keycloak \
-e 'KC_BOOTSTRAP_ADMIN_USERNAME=admin' \
-e 'KC_BOOTSTRAP_ADMIN_PASSWORD=admin' \
-e 'KC_HTTPS_CERTIFICATE_FILE=/keycloak/tls.crt.pem' \
-e 'KC_HTTPS_CERTIFICATE_KEY_FILE=/keycloak/tls.key.pem' \
-p 8543:8443 \
-v ./keycloak/tls:/keycloak \
-v ./keycloak/realm-export.json:/opt/keycloak/data/import/realm-export.json \
keycloak/keycloak:latest -v start-dev --import-realm
```
You can log in to the Keycloak administration interface at https://localhost:8543/ using the default Keycloak root adminstrative account, which is only for managing Keycloak:
- Username: admin
- Password: admin

A normal user account has also been set up for application logins as:
- Username: user
- Password: password

The "well known" endpoint for the ralm is: https://localhost:8543/realms/master/.well-known/openid-configuration

### Google OAuth Example

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an OAuth 2.0 Client ID
5. Set the authorized redirect URI to: `http://localhost:3001/authoring/api/auth/oauth/callback`
6. Copy the Client ID and Client Secret

Configuration:
```bash
AUTH_OAUTH_ACTIVE=true
AUTH_OAUTH_CLIENT_ID=your-google-client-id
AUTH_OAUTH_CLIENT_SECRET=your-google-client-secret
AUTH_OAUTH_ISSUER_URL=https://accounts.google.com
AUTH_OAUTH_SCOPE=openid profile email
```

### Microsoft Azure AD Example

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Create a new registration
4. Set the redirect URI to: `http://localhost:3001/authoring/api/auth/oauth/callback`
5. Copy the Application (client) ID and create a client secret

Configuration:
```bash
AUTH_OAUTH_ACTIVE=true
AUTH_OAUTH_CLIENT_ID=your-azure-client-id
AUTH_OAUTH_CLIENT_SECRET=your-azure-client-secret
AUTH_OAUTH_ISSUER_URL=https://login.microsoftonline.com/your-tenant-id/v2.0
AUTH_OAUTH_SCOPE=openid profile email
```

### Generic OpenID Connect Provider

For any OpenID Connect compliant provider:

1. Obtain the issuer URL from your provider
2. Get the client ID and client secret
3. Configure the redirect URI in your provider

Configuration:
```bash
AUTH_OAUTH_ACTIVE=true
AUTH_OAUTH_CLIENT_ID=your-client-id
AUTH_OAUTH_CLIENT_SECRET=your-client-secret
AUTH_OAUTH_ISSUER_URL=https://your-provider.com
AUTH_OAUTH_SCOPE=openid profile email
```

## Frontend Integration

The frontend has been updated to include an "OAuth Login" button alongside the traditional login form. When users click this button, they will be redirected to the OAuth provider for authentication.

### User Experience

1. User clicks "OAuth Login" button
2. User is redirected to the OAuth provider
3. User authenticates with the OAuth provider
4. User is redirected back to the application
5. User is automatically logged in

## Security Considerations

1. **HTTPS in Production**: Always use HTTPS in production environments
2. **Client Secret**: Keep the client secret secure and never expose it in client-side code
3. **Redirect URI**: Ensure the redirect URI is exactly configured in your OAuth provider
4. **Session Security**: The application uses secure session cookies in production

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**: Ensure the redirect URI in your OAuth provider matches exactly what's configured
2. **"Invalid client"**: Check that the client ID and secret are correct
3. **"Scope not supported"**: Verify that the requested scope is supported by your OAuth provider
4. **CORS issues**: Ensure your OAuth provider allows requests from your domain

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will provide more detailed error messages in the console.

## Testing

To test the OAuth integration:

1. Configure your OAuth provider
2. Set the environment variables or configuration file
3. Start the API server: `npm start` (in the `api` directory)
4. Start the frontend: `npm start` (in the `frontend` directory)
5. Navigate to the application and click "OAuth Login"
6. Complete the OAuth flow with your provider
7. Verify you are logged in successfully

## Multiple Authentication Methods

You can enable multiple authentication methods simultaneously:

```bash
# Enable all three methods
AUTH_LDAP_ACTIVE=true
AUTH_LOCAL_ACTIVE=true
AUTH_OAUTH_ACTIVE=true
```

Users can choose their preferred method from the login interface.
