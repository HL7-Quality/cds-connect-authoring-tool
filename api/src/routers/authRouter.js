import express from 'express';
import auth from '../handlers/authHandler.js';

const AuthRouter = express.Router();

AuthRouter.route('/login').post(auth.login);

AuthRouter.route('/logout').get(auth.logout);

AuthRouter.route('/user').get(auth.currentUser);

// OAuth routes
AuthRouter.route('/oauth').get(auth.oauthLogin);
AuthRouter.route('/oauth/callback').get(auth.oauthCallback);

export default AuthRouter;
