export interface TokenRequest{
  username: string,
  password: string,
  clientId: string,
  // required when signing up with username/password
  grantType: string,
  refreshToken: string,
  // space-separated list of scopes for which the token is issued
  scope: string
}
