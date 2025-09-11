import path from 'path';
import convict from 'convict';
import validator from 'validator';
import json5 from 'json5';
import fs from 'fs';

function laxUrl(...protocols) {
  return val => {
    if (!validator.isURL(val, { protocols, require_tld: false, allow_underscores: true })) {
      throw new Error(`must be a URL with protocol from {${protocols}}`);
    }
  };
}

// Define the schema
convict.addParser({ extension: 'json', parse: json5.parse });
const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  mongo: {
    url: {
      doc: 'The connection URL for MongoDB.',
      format: laxUrl('mongodb'),
      default: 'mongodb://localhost/cds_authoring',
      env: 'MONGO_URL'
    }
  },
  migrations: {
    active: {
      doc: 'Indicates if migrations are automatically applied on startup',
      format: 'Boolean',
      default: true,
      env: 'MIGRATIONS_ACTIVE'
    }
  },
  cqlToElm: {
    url: {
      doc: 'The URL endpoint for the CQL translation service.',
      format: laxUrl('http', 'https'),
      default: 'http://localhost:8080/cql/translator',
      env: 'CQL_TO_ELM_URL'
    },
    active: {
      doc: 'Indicates if CQL translation is active (only disable for dev)',
      format: 'Boolean',
      default: true,
      env: 'CQL_TO_ELM_ACTIVE'
    }
  },
  cqlFormatter: {
    url: {
      doc: 'The URL endpoint for the CQL formatter service.',
      format: laxUrl('http', 'https'),
      default: 'http://localhost:8080/cql/formatter',
      env: 'CQL_FORMATTER_URL'
    },
    active: {
      doc: 'Indicates if CQL formatter is active (requires translation service 1.5.10 or above)',
      format: 'Boolean',
      default: true,
      env: 'CQL_FORMATTER_ACTIVE'
    }
  },
  auth: {
    session: {
      secret: {
        doc: 'The session secret.',
        format: 'String',
        default: 'secret',
        env: 'AUTH_SESSION_SECRET',
        sensitive: true
      }
    },
    ldap: {
      active: {
        doc: 'Indicates if the LDAP authentication strategy should be used',
        format: 'Boolean',
        default: true,
        env: 'AUTH_LDAP_ACTIVE'
      },
      server: {
        doc:
          'LDAP config passed into passport for authentication.  The tokens `{{username}}` and `{{password}}`' +
          'will be replaced during authentication with the authenticating username and password.',
        url: {
          doc: 'The LDAP connection URL.',
          format: laxUrl('ldap', 'ldaps'),
          default: 'ldap://localhost:389',
          env: 'AUTH_LDAP_URL'
        },
        bindDN: {
          doc: 'The LDAP bind DN.',
          format: 'String',
          default: 'cn=root',
          env: 'AUTH_LDAP_BIND_DN'
        },
        bindCredentials: {
          doc: 'The LDAP bind credentials.',
          format: 'String',
          default: 'secret',
          env: 'AUTH_LDAP_BIND_CREDENTIALS',
          sensitive: true
        },
        searchBase: {
          doc: 'The LDAP search base.',
          format: 'String',
          default: 'ou=passport-ldapauth',
          env: 'AUTH_LDAP_SEARCH_BASE'
        },
        searchFilter: {
          doc: 'The LDAP search filter.',
          format: 'String',
          default: '(uid={{username}})',
          env: 'AUTH_LDAP_SEARCH_FILTER'
        },
        tlsOptions: {
          minVersion: {
            doc: 'The minimum TLS version to allow (TLSv1.3, TLSv1.2, TLSv1.1, or TLSv1)',
            format: 'String',
            default: 'TLSv1.2',
            env: 'AUTH_LDAP_TLS_MIN_VERSION'
          },
          ca: {
            doc: 'List of certificates to trust when validating LDAPS connection.',
            format: 'Array',
            nullable: true,
            default: null,
            env: 'AUTH_LDAP_TLS_CA'
          },
          rejectUnauthorized: {
            doc: 'Indicates if TLS should reject unauthorized certificates for LDAPS connection.',
            format: 'Boolean',
            default: true,
            env: 'AUTH_LDAP_TLS_REJECT_UNAUTHORIZED'
          }
        }
      }
    },
    local: {
      active: {
        doc:
          'Indicates if the local authentication strategy should be used. If active, a ' +
          '`config/local-users.json` file must be created to specify credentials.',
        format: 'Boolean',
        default: false,
        env: 'AUTH_LOCAL_ACTIVE'
      }
    },
    oauth: {
      active: {
        doc: 'Indicates if the OAuth/OpenID Connect authentication strategy should be used',
        format: 'Boolean',
        default: false,
        env: 'AUTH_OAUTH_ACTIVE'
      },
      clientID: {
        doc: 'The OAuth client ID',
        format: 'String',
        default: '',
        env: 'AUTH_OAUTH_CLIENT_ID'
      },
      clientSecret: {
        doc: 'The OAuth client secret',
        format: 'String',
        default: '',
        env: 'AUTH_OAUTH_CLIENT_SECRET',
        sensitive: true
      },
      issuerURL: {
        doc: 'The OAuth issuer URL (e.g., https://accounts.google.com)',
        format: 'String',
        default: '',
        env: 'AUTH_OAUTH_ISSUER_URL'
      },
      authorizationURL: {
        doc: 'The OAuth authorization URL',
        format: 'String',
        default: '',
        env: 'AUTH_OAUTH_AUTHORIZATION_URL'
      },
      tokenURL: {
        doc: 'The OAuth token URL',
        format: 'String',
        default: '',
        env: 'AUTH_OAUTH_TOKEN_URL'
      },
      userInfoURL: {
        doc: 'The OAuth user info URL',
        format: 'String',
        default: '',
        env: 'AUTH_OAUTH_USER_INFO_URL'
      },
      scope: {
        doc: 'The OAuth scope (space-separated)',
        format: 'String',
        default: 'openid profile email',
        env: 'AUTH_OAUTH_SCOPE'
      },
      callbackURL: {
        doc: 'The OAuth callback URL',
        format: laxUrl('http', 'https'),
        default: 'http://localhost:3001/authoring/api/auth/oauth/callback',
        env: 'AUTH_OAUTH_CALLBACK_URL'
      }
    }
  },
  tlsRejectUnauthorized: {
    doc: 'Indicates if TLS should reject unauthorized certificates.  Never disable in production!',
    format: ['0', '1'],
    default: '1',
    env: 'NODE_TLS_REJECT_UNAUTHORIZED'
  },
  foreSee: {
    src: {
      doc: 'The special ForeSee source string to include in the ForeSee javascript snippet.',
      format: 'String',
      default: 'https://gateway.foresee.com/sites/[your sitekey]/staging/gateway.min.js',
      env: 'FORESEE_SRC'
    },
    active: {
      doc: 'Indicates if ForeSee integration is active',
      format: 'Boolean',
      default: false,
      env: 'FORESEE_ACTIVE'
    }
  },
  terminologyService: {
    doc: 'Terminology Service Endpoint URL',
    format: 'String',
    default: 'https://cts.nlm.nih.gov/fhir',
    env: 'TERMINOLOGY_ENDPOINT'
  }
});

// Load environment dependent configuration
const files = [];
// Look for an environment-based file (e.g., config/production.json)
const envFile = path.join(process.cwd(), 'config', `${config.get('env')}.json`);
if (fs.existsSync(envFile)) {
  files.push(envFile);
}
// Look for a local config file to override config locally (in development)
const localFile = path.join(process.cwd(), 'config', 'local.json');
if (fs.existsSync(localFile)) {
  files.push(localFile);
}
// Load any config files that were found.  If no, default value will be used.
if (files.length > 0) {
  config.loadFile(files);
}

// Perform validation
config.validate({ allowed: 'warn' });

console.log('Loaded config:', config.toString());

export default config;
