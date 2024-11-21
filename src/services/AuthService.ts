import { Service } from 'typedi';
import { googleClient, githubConfig } from '../config/oauth';
import User from '../models/User';
import logger from '../utils/logger';
import axios from 'axios';

@Service()
export class AuthService {
  async googleAuth(code: string) {
    try {
      const { tokens } = await googleClient.getToken(code);
      const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      
      const payload = ticket.getPayload()!;
      
      let user = await User.findOne({ email: payload.email });
      if (!user) {
        user = await User.create({
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          googleId: payload.sub
        });
        logger.info(`New user registered via Google: ${payload.email}`);
      }

      return { user, accessToken: tokens.access_token };
    } catch (error) {
      logger.error('Google authentication error:', error);
      throw error;
    }
  }

  async githubAuth(code: string) {
    try {
      // Get access token
      const tokenResponse = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: githubConfig.clientId,
          client_secret: githubConfig.clientSecret,
          code,
          redirect_uri: githubConfig.redirectUri
        },
        {
          headers: { Accept: 'application/json' }
        }
      );

      const accessToken = tokenResponse.data.access_token;

      // Get user data
      const userResponse = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const githubUser = userResponse.data;

      let user = await User.findOne({ githubId: githubUser.id });
      if (!user) {
        user = await User.create({
          email: githubUser.email,
          name: githubUser.name,
          picture: githubUser.avatar_url,
          githubId: githubUser.id
        });
        logger.info(`New user registered via GitHub: ${githubUser.email}`);
      }

      return { user, accessToken };
    } catch (error) {
      logger.error('GitHub authentication error:', error);
      throw error;
    }
  }
}