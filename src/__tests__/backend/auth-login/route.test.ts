import { jest } from '@jest/globals';
import { NextApiRequest, NextApiResponse } from 'next';
import httpMocks from 'node-mocks-http';
import { createClient } from '@supabase/supabase-js';
import authLogin from '@/app/api/auth-login/route';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

interface MockResponse extends NextApiResponse {
  _getStatusCode(): number;
  _getData(): string;
}

describe('authLogin API', () => {
  let mockReq: NextApiRequest;
  let mockRes: MockResponse;
  let mockSupabaseClient: any;

  beforeEach(() => {
    mockReq = httpMocks.createRequest();
    mockRes = httpMocks.createResponse();
    mockSupabaseClient = {
      auth: {
        signInWithPassword: jest.fn(),
      },
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  it('正常なログインのテスト', async () => {
    mockReq.method = 'POST';
    mockReq.body = { email: 'test@example.com', password: 'password123' };
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { session: { access_token: 'mockToken' } },
      error: null,
    });

    await authLogin(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(200);
    expect(JSON.parse(mockRes._getData())).toEqual({ token: 'mockToken' });
  });

  it('無効な認証情報のテスト', async () => {
    mockReq.method = 'POST';
    mockReq.body = { email: 'invalid@example.com', password: 'wrongpassword' };
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: '認証に失敗しました' },
    });

    await authLogin(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(401);
    expect(JSON.parse(mockRes._getData())).toEqual({ error: '認証に失敗しました' });
  });

  it('POSTメソッド以外のリクエストのテスト', async () => {
    mockReq.method = 'GET';

    await authLogin(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(405);
    expect(JSON.parse(mockRes._getData())).toEqual({ error: 'メソッドが許可されていません' });
  });

  it('不完全なリクエストボディのテスト', async () => {
    mockReq.method = 'POST';
    mockReq.body = { email: 'test@example.com' }; // パスワードが欠落

    await authLogin(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(400);
    expect(JSON.parse(mockRes._getData())).toEqual({ error: 'メールアドレスとパスワードが必要です' });
  });

  it('Supabaseエラーのテスト', async () => {
    mockReq.method = 'POST';
    mockReq.body = { email: 'test@example.com', password: 'password123' };
    mockSupabaseClient.auth.signInWithPassword.mockRejectedValue(new Error('Supabaseエラー'));

    await authLogin(mockReq, mockRes);

    expect(mockRes._getStatusCode()).toBe(500);
    expect(JSON.parse(mockRes._getData())).toEqual({ error: '内部サーバーエラー' });
  });
});