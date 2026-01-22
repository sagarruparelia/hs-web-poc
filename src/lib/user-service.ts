interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface UserServiceResponse {
  enterpriseId: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getClientCredentialsToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token;
  }

  const tokenUrl = process.env.USER_SERVICE_TOKEN_URL!;
  const clientId = process.env.USER_SERVICE_CLIENT_ID!;
  const clientSecret = process.env.USER_SERVICE_CLIENT_SECRET!;

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.status}`);
  }

  const data: TokenResponse = await response.json();

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

export async function getEnterpriseId(sub: string): Promise<string> {
  const accessToken = await getClientCredentialsToken();
  const apiUrl = process.env.USER_SERVICE_API_URL!;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      hsid_uuid: sub,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get enterprise ID: ${response.status}`);
  }

  const data: UserServiceResponse = await response.json();
  return data.enterpriseId;
}
