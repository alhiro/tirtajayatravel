export class AuthModel {
  userName!: string;
  level!: number;
  city_id!: number;
  authToken!: string;
  refreshToken!: string;
  expiresIn!: string;
  remember?: boolean;

  setAuth(auth: AuthModel) {
    this.userName = auth.userName;
    this.level = auth.level;
    this.city_id = auth.city_id;
    this.authToken = auth.authToken;
    this.refreshToken = auth.refreshToken;
    this.expiresIn = auth.expiresIn;
    this.remember = auth.remember;
  }
}
