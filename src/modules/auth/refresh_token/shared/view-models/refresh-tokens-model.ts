import { Refresh_Tokens } from '../models/refresh-tokens';

export class Refresh_Tokens_View_Model {
  static toHttp(refresh_token: Refresh_Tokens) {
    return {
      id: refresh_token.id,
      user_id: refresh_token.user_id,
      token_hash: refresh_token.token_hash,
      revoked_at: refresh_token.revoked_at,
      expires_at: refresh_token.expires_at,
      created_at: refresh_token.created_at,
      updated_at: refresh_token.updated_at,
    };
  }
}
