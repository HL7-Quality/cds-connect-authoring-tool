import passport from 'passport';
import config from '../config.js';
import { sendUnauthorized } from './common.js';

function login(req, res, next) {
  // If the user is already logged in, log out first
  if (req.user) {
    req.logout(function () {});
  }

  // Add strategies for authentication based on configuration
  const strategies = [];
  if (config.get('auth.local.active')) {
    strategies.push('local');
  }
  // Note that due to bugs in how the LDAP strategy handles errors, it needs to go last
  // when there are multiple strategies (else it throws and skips remaining strategies)
  if (config.get('auth.ldap.active')) {
    strategies.push('ldapauth');
  }
  // OAuth is handled separately via the /oauth route, not through the login endpoint

  // Remember if we already got an authentication response, because sometimes the LDAP
  // strategy invokes the callback more than one time!
  let handledAuthResponse = false;
  passport.authenticate(strategies, { failWithError: true })(req, res, err => {
    if (handledAuthResponse) {
      return;
    }
    handledAuthResponse = true;
    const remoteIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (err) {
      console.log(
        `${new Date().toISOString()}: Login FAILURE: ${req?.body?.username || 'unknown'} (${remoteIP})`, err
      );
      return sendUnauthorized(res);
    } else {
      console.log(`${new Date().toISOString()}: Login SUCCESS: ${req?.user?.uid || 'unknown'} (${remoteIP})`);
      return res.json(req.user);
    }
  });
}

function logout(req, res) {
  req.logout(function () {
    req.session = null;
    res.sendStatus(200);
  });
}

function currentUser(req, res) {
  if (req.user) {
    res.json(req.user);
  } else {
    sendUnauthorized(res);
  }
}

function oauthLogin(req, res, next) {
  if (!config.get('auth.oauth.active')) {
    return sendUnauthorized(res);
  }

  // If the user is already logged in, log out first
  if (req.user) {
    req.logout(function () {});
  }

  passport.authenticate('oauth')(req, res, next);
}

function oauthCallback(req, res, next) {
  if (!config.get('auth.oauth.active')) {
    return sendUnauthorized(res);
  }

  passport.authenticate('oauth', { failureRedirect: '/authoring/api/auth/login' })(req, res, (err) => {
    if (err) {
      console.log(`${new Date().toISOString()}: OAuth login FAILURE: ${err.message}`);
      return res.redirect('/authoring/api/auth/login?error=oauth_failed');
    }

    const remoteIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`${new Date().toISOString()}: OAuth login SUCCESS: ${req?.user?.uid || 'unknown'} (${remoteIP})`);
    
    // Redirect to the frontend with success
    res.redirect('/?login=success');
  });
}

export default {
  login,
  currentUser,
  logout,
  oauthLogin,
  oauthCallback
};
