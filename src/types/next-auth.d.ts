import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      sub?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      firstName?: string;
      lastName?: string;
      enterpriseId?: string;
      idToken?: string;
    };
  }

  interface Profile {
    sub?: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    email?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    firstName?: string;
    lastName?: string;
    enterpriseId?: string;
    idToken?: string;
  }
}
