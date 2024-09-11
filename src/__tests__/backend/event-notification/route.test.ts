import { jest } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import handleEventNotification from '@/app/api/event-notification.ts/route';

interface MockResponse extends NextApiResponse {
  _getStatusCode(): number;
  _getData(): string;
}

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    data: [
      {
        id: 'event-id',
        name: 'テストイベント',
        description: 'テストイベントの説明',
        start_datetime: '2023-07-01T10:00:00Z',
        end_datetime: '2023-07-01T12:00:00Z',
        location: '東京都渋谷区',
      },
    ],
    error: null,
  })),
}));

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  }),
}));

describe('イベント通知送信API', () => {
  it('正常にイベント通知を送信する', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'POST',
      body: {
        eventId: 'event-id',
        changes: {
          name: '更新されたイベント名',
          start_datetime: '2023-07-02T11:00:00Z',
        },
      },
    });

    await handleEventNotification(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'イベント通知が正常に送信されました',
    });
  });

  it('イベントIDが提供されていない場合はエラーを返す', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'POST',
      body: {
        changes: {
          name: '更新されたイベント名',
        },
      },
    });

    await handleEventNotification(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'イベントIDが提供されていません',
    });
  });

  it('変更内容が提供されていない場合はエラーを返す', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'POST',
      body: {
        eventId: 'event-id',
      },
    });

    await handleEventNotification(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: '変更内容が提供されていません',
    });
  });

  it('POSTメソッド以外のリクエストに対してはエラーを返す', async () => {
    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'GET',
    });

    await handleEventNotification(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'メソッドが許可されていません',
    });
  });

  it('データベースエラーの場合は500エラーを返す', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockSupabaseClient = require('@supabase/supabase-js').createClient();
    mockSupabaseClient.from().select().eq.mockReturnValueOnce({
      data: null,
      error: new Error('データベースエラー'),
    });

    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'POST',
      body: {
        eventId: 'event-id',
        changes: {
          name: '更新されたイベント名',
        },
      },
    });

    await handleEventNotification(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'イベント情報の取得中にエラーが発生しました',
    });
  });

  it('メール送信エラーの場合は500エラーを返す', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockNodemailer = require('nodemailer');
    mockNodemailer.createTransport().sendMail.mockRejectedValueOnce(new Error('メール送信エラー'));

    const { req, res } = createMocks<NextApiRequest, MockResponse>({
      method: 'POST',
      body: {
        eventId: 'event-id',
        changes: {
          name: '更新されたイベント名',
        },
      },
    });

    await handleEventNotification(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'イベント通知の送信中にエラーが発生しました',
    });
  });
});