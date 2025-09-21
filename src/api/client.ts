const BASE_URL = 'http://172.20.10.4:8080/api/v1';

export interface UserLogin {
  username: string;
  password: string;
}

export interface UserRegister {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
}

export interface RegisterResponse {
  message: string;
  user_id: number;
}

export interface Tree {
  id: number;
  lat: number;
  lng: number;
  type: string;
  lidar_url: string | null;
}

export interface WorkLog {
  id: number;
  date: string;
  description: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('access_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async login(credentials: UserLogin): Promise<TokenResponse> {
    return this.request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: UserRegister): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Tree endpoints
  async getTrees(): Promise<Tree[]> {
    return this.request<Tree[]>('/trees');
  }

  async getTree(treeId: number): Promise<Tree> {
    return this.request<Tree>(`/trees/${treeId}`);
  }

  async createTree(data: { lat: number; lng: number; type: string }): Promise<Tree> {
    return this.request<Tree>('/trees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Work log endpoints
  async getWorkLogs(treeId: number): Promise<WorkLog[]> {
    return this.request<WorkLog[]>(`/trees/${treeId}/worklogs`);
  }

  async createWorkLog(treeId: number, data: { date: string; description: string }): Promise<WorkLog> {
    return this.request<WorkLog>(`/trees/${treeId}/worklogs`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();