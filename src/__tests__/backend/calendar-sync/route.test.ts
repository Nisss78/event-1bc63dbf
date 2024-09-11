import { jest } from '@jest/globals';
import { NextApiRequest, NextApiResponse } from 'next';
import httpMocks from 'node-mocks-http';
import calendarSync from '@/app/api/calendar-sync.ts/route';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
}));

jest.mock('axios');

interface MockResponse extends NextApiResponse {
  _getStatusCode(): number;
  _getData(): string;
}

describe('カレンダー同期 API', () => {
  let req: NextApiRequest;
  let res: MockResponse;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
  });

  it('イベントデータを正常に同期する', async () => {
    const mockEventData = {
      id: '1',
      name: 'テストイベント',
      start_datetime: '2023-06-01T10:00:00Z',
      end_datetime: '2023-06-01T12:00:00Z',
    };

    req.method = 'POST';
    req.body = { eventId: '1' };

    const mockAxios = jest.spyOn(require('axios'), 'default');
    mockAxios.mockResolvedValueOnce({ data: { success: true } });

    await calendarSync(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ message: '同期が完了しました' });
  });

  it('イベントデータの取得に失敗した場合', async () => {
    req.method = 'POST';
    req.body = { eventId: '999' };

    const mockSupabase = require('@supabase/supabase-js').createClient();
    mockSupabase.from().select().single.mockRejectedValueOnce(new Error('イベントが見つかりません'));

    await calendarSync(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(JSON.parse(res._getData())).toEqual({ error: 'イベントが見つかりません' });
  });

  it('外部カレンダーサービスとの同期に失敗した場合', async () => {
    const mockEventData = {
      id: '1',
      name: 'テストイベント',
      start_datetime: '2023-06-01T10:00:00Z',
      end_datetime: '2023-06-01T12:00:00Z',
    };

    req.method = 'POST';
    req.body = { eventId: '1' };

    const mockAxios = jest.spyOn(require('axios'), 'default');
    mockAxios.mockRejectedValueOnce(new Error('外部APIエラー'));

    await calendarSync(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({ error: '外部カレンダーとの同期に失敗しました' });
  });

  it('不正なHTTPメソッドの場合', async () => {
    req.method = 'GET';

    await calendarSync(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Method Not Allowed' });
  });

  it('リクエストボディが不正な場合', async () => {
    req.method = 'POST';
    req.body = {};

    await calendarSync(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ error: 'イベントIDが指定されていません' });
  });
});