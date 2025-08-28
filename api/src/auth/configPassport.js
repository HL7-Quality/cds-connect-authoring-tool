import fs from 'fs';
import process from 'process';
import session from 'express-session';
import passport from 'passport';
import LdapStrategy from 'passport-ldapauth';
import LocalStrategy from 'passport-local';
import MongoStore from 'connect-mongo';
import _ from 'lodash';
import config from '../config.js';
import { findByUsername as findLocalUserById } from './localAuthUsers.js';

function getLdapConfiguration(req, callback) {
  // Replace {{username}} and {{password}} with values from request
  const ldapConfig = _.cloneDeep(config.get('auth.ldap'));
  if (ldapConfig && ldapConfig.server) {
    const server = ldapConfig.server;
    Object.keys(server).forEach(key => {
      if (typeof server[key] === 'string') {
        server[key] = server[key]
          .replace(/\{\{username\}\}/g, req.body.username)
          .replace(/\{\{password\}\}/g, req.body.password);
      }
    });
  }
  if (
    ldapConfig &&
    ldapConfig.server &&
    ldapConfig.server.tlsOptions &&
    Array.isArray(ldapConfig.server.tlsOptions.ca)
  ) {
    ldapConfig.server.tlsOptions.ca = ldapConfig.server.tlsOptions.ca
      .map(f => {
        try {
          return fs.readFileSync(f);
        } catch {
          console.error(`Failed to load certificate for LDAP: ${f}`);
        }
      })
      .filter(c => c != null);
  }
  callback(null, ldapConfig);
}

function getLocalConfiguration(username, password, done, users = null) {
  findLocalUserById(
    username,
    (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false);
      }
      if (user.password !== password) {
        return done(null, false);
      }
      return done(null, user);
    },
    users
  );
}

export default app => {
  // Configuring cookie security as suggested at: https://github.com/expressjs/session#cookiesecure
  const sess = {
    secret: config.get('auth.session.secret'),
    cookie: { sameSite: 'strict' },
    unset: 'destroy',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: config.get('mongo.url') })
  };
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1); // trust first proxy
    sess.cookie.secure = true; // serve secure cookies
  }
  app.use(session(sess));

  // Configure authentication using Passport LDAP Strategy
  if (config.get('auth.ldap.active')) {
    passport.use(new LdapStrategy(getLdapConfiguration));
  }

  // Configure authentication using Passport Local Strategy - enabled based on configuration
  if (config.get('auth.local.active')) {
    passport.use(new LocalStrategy.Strategy(getLocalConfiguration));
  }

  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser((user, done) => {
    done(null, user.uid);
  });
  passport.deserializeUser((uid, done) => {
    // In the future, we might store user info (name, roles, etc) in Mongo via the passport.authenticate cb.
    // If we did that, this is where we would reconstitute the user from Mongo.
    done(null, { uid });
  });
};

export { getLdapConfiguration, getLocalConfiguration };
