export class AuthModel {
  userName!: string;
  level!: number;
  authToken!: string;
  refreshToken!: string;
  expiresIn!: string;
  remember?: boolean;

  setAuth(auth: AuthModel) {
    this.userName = auth.userName;
    this.level = auth.level;
    this.authToken = auth.authToken;
    this.refreshToken = auth.refreshToken;
    this.expiresIn = auth.expiresIn;
    this.remember = auth.remember;
  }
}
