import { jest } from '@jest/globals';
import { NextApiRequest, NextApiResponse } from 'next';
import httpMocks from 'node-mocks-http';
import dataBackup from '@/app/api/data-backup.ts/route';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ data: [{ id: 1, name: 'テストデータ' }] }),
    })),
  })),
}));

jest.mock('node:zlib', () => ({
  gzipSync: jest.fn(() => Buffer.from('圧縮データ')),
}));

jest.mock('node:crypto', () => ({
  randomBytes: jest.fn(() => Buffer.from('ランダムキー')),
  createCipheriv: jest.fn(() => ({
    update: jest.fn(() => Buffer.from('暗号化データ')),
    final: jest.fn(() => Buffer.from('')),
  })),
}));

jest.mock('node:fs', () => ({
  writeFileSync: jest.fn(),
}));

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({}),
  })),
}));

interface MockResponse extends NextApiResponse {
  _getStatusCode(): number;
  _getData(): string;
}

describe('データバックアップAPI', () => {
  let req: NextApiRequest;
  let res: MockResponse;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
  });

  it('バックアップが正常に実行される', async () => {
    await dataBackup(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ message: 'バックアップが正常に完了しました' });
  });

  it('データベース接続エラーの場合、500エラーを返す', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockSupabaseError = new Error('データベース接続エラー');
    require('@supabase/supabase-js').createClient.mockReturnValueOnce({
      from: jest.fn(() => ({
        select: jest.fn().mockRejectedValue(mockSupabaseError),
      })),
    });

    await dataBackup(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({ error: 'バックアップ処理中にエラーが発生しました' });
  });

  it('ファイル書き込みエラーの場合、500エラーを返す', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockWriteError = new Error('ファイル書き込みエラー');
    require('node:fs').writeFileSync.mockImplementationOnce(() => {
      throw mockWriteError;
    });

    await dataBackup(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({ error: 'バックアップ処理中にエラーが発生しました' });
  });

  it('メール送信エラーの場合、500エラーを返す', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockMailError = new Error('メール送信エラー');
    require('nodemailer').createTransport.mockReturnValueOnce({
      sendMail: jest.fn().mockRejectedValue(mockMailError),
    });

    await dataBackup(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({ error: 'バックアップ処理中にエラーが発生しました' });
  });
});