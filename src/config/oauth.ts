import { OAuth2Client } from 'google-auth-library';
import config from './index';

export const googleClient = new OAuth2Client({
  clientId: config.oauth.google.clientId,
  clientSecret: config.oauth.google.clientSecret,
  redirectUri: config.oauth.google.redirectUri
});

export const githubConfig = {
  clientId: config.oauth.github.clientId,
  clientSecret: config.oauth.github.clientSecret,
  redirectUri: config.oauth.github.redirectUri
};