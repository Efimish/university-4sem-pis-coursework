declare namespace App {
  interface SessionData {
    user: {
      id: number;
      login: string;
      name: string;
      isManager: boolean;
    };
  }
}
