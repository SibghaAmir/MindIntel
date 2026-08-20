// Use environment variable for backend URL, fallback to localhost for development
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const fetchApi = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  try {
    // Basic timeout setup
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout for LLM

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData.detail || 'An error occurred with the API');
    }

    return await response.json();
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. The AI took too long to analyze.');
    }
    throw error;
  }
};
