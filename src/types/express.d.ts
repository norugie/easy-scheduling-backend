export {};

declare global {
  namespace Express {
    interface Request {
      auth?: {
        id: number;
        username: string;
        name: string;
        email: string;
        phoneNumber: string;
      };
    }
  }
}
