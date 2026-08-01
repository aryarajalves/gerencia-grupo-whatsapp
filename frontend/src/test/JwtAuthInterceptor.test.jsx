import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import axiosInstance from '../services/api';

describe('Axios JWT Interceptor', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('injeta o token Bearer JWT no cabeçalho Authorization se o token estiver no localStorage', async () => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NSJ9';
    localStorage.setItem('accessToken', fakeToken);

    // Executa um request interceptor do axios
    const config = await axiosInstance.interceptors.request.handlers[0].fulfilled({
      headers: {}
    });

    expect(config.headers['Authorization']).toBe(`Bearer ${fakeToken}`);
  });
});
