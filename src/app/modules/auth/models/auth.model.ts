export class AuthModel {
  userName!: string;
  authToken!: string;
  refreshToken!: string;
  expiresIn!: string;
  remember?: boolean;

  setAuth(auth: AuthModel) {
    this.userName = auth.userName;
    this.authToken = auth.authToken;
    this.refreshToken = auth.refreshToken;
    this.expiresIn = auth.expiresIn;
    this.remember = auth.remember;
  }
}
