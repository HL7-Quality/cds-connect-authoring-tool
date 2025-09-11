import OpenIDConnectStrategy from 'passport-openidconnect';
import config from '../config.js';

function getOAuthConfiguration() {
  const oauthConfig = config.get('auth.oauth');
  
  if (!oauthConfig.active) {
    return null;
  }

  // Validate required configuration
  const requiredFields = ['clientID', 'clientSecret', 'issuerURL'];
  const missingFields = requiredFields.filter(field => !oauthConfig[field] || oauthConfig[field].trim() === '');
  
  if (missingFields.length > 0) {
    console.error(`OAuth configuration missing required fields: ${missingFields.join(', ')}`);
    return null;
  }

  return {
    issuerURL: oauthConfig.issuerURL,
    authorizationURL: oauthConfig.authorizationURL || `${oauthConfig.issuerURL}/oauth/authorize`,
    tokenURL: oauthConfig.tokenURL || `${oauthConfig.issuerURL}/oauth/token`,
    userInfoURL: oauthConfig.userInfoURL || `${oauthConfig.issuerURL}/oauth/userinfo`,
    clientID: oauthConfig.clientID,
    clientSecret: oauthConfig.clientSecret,
    callbackURL: oauthConfig.callbackURL,
    scope: oauthConfig.scope || 'openid profile email'
  };
}

function createOAuthStrategy() {
  const oauthConfig = getOAuthConfiguration();
  
  if (!oauthConfig) {
    return null;
  }

  return new OpenIDConnectStrategy(
    {
      issuer: oauthConfig.issuerURL,
      authorizationURL: oauthConfig.authorizationURL,
      tokenURL: oauthConfig.tokenURL,
      userInfoURL: oauthConfig.userInfoURL,
      clientID: oauthConfig.clientID,
      clientSecret: oauthConfig.clientSecret,
      callbackURL: oauthConfig.callbackURL,
      scope: oauthConfig.scope
    },
    (issuer, sub, profile, accessToken, refreshToken, done) => {
      // Extract user information from the OAuth profile
      const user = {
        uid: profile.id || profile.sub || profile.email,
        email: profile.email,
        name: profile.displayName || profile.name || profile.given_name + ' ' + profile.family_name,
        given_name: profile.given_name,
        family_name: profile.family_name,
        provider: 'oauth',
        accessToken,
        refreshToken
      };

      console.log(`OAuth login successful for user: ${user.uid}`);
      return done(null, user);
    }
  );
}

export { getOAuthConfiguration, createOAuthStrategy };
