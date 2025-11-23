export class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: any = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      headers['Cookie'] = `next-auth.session-token=${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({})); // Handle empty/text response

    return {
      status: response.status,
      data,
      headers: response.headers,
    };
  }

  async post(url: string, data?: any): Promise<any> {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async get(url: string): Promise<any> {
    return this.request(url, {
      method: 'GET',
    });
  }

  async put(url: string, data?: any): Promise<any> {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(url: string): Promise<any> {
    return this.request(url, {
      method: 'DELETE',
    });
  }
}
