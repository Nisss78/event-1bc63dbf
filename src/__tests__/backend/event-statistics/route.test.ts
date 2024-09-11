import { jest } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '@/app/api/event-statistics.ts/route';

interface MockResponse extends NextApiResponse {
  _getStatusCode(): number;
  _getData(): string | object;
}

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({
      data: [
        { status: '参加予定', count: 5 },
        { status: 'cancelled', count: 2 },
        { status: 'pending', count: 3 },
      ],
      error: null,
    }),
  })),
}));

describe('イベント参加統計 API', () => {
  it('正常なリクエストで統計データを返す', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'GET',
      query: { eventId: 'test-event-id' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData() as string);
    expect(data).toEqual({
      participantsCount: 5,
      cancelledCount: 2,
      pendingCount: 3,
      totalCount: 10,
    });
  });

  it('イベントIDが指定されていない場合はエラーを返す', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData() as string);
    expect(data).toEqual({ error: 'イベントIDが指定されていません' });
  });

  it('GETメソッド以外のリクエストの場合はエラーを返す', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'POST',
      query: { eventId: 'test-event-id' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    const data = JSON.parse(res._getData() as string);
    expect(data).toEqual({ error: 'メソッドが許可されていません' });
  });

  it('データベースエラーの場合は500エラーを返す', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'GET',
      query: { eventId: 'test-event-id' },
    });

    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.mocked(createClient).mockReturnValueOnce({
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({
        data: null,
        error: new Error('データベースエラー'),
      }),
    } as any);

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData() as string);
    expect(data).toEqual({ error: 'サーバーエラーが発生しました' });
  });
});