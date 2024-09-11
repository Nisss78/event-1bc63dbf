import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { gzipSync } from 'node:zlib';
import { randomBytes, createCipheriv } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import nodemailer from 'nodemailer';
import { supabase } from '@/supabase';

export default async function dataBackup(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1. データベースの全テーブルデータを取得する
    const tables = ['events', 'participants', 'users'];
    const backupData: Record<string, any> = {};

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*');

      if (error) throw error;
      backupData[table] = data;
    }

    // 2. データを圧縮し暗号化する
    const jsonData = JSON.stringify(backupData);
    const compressedData = gzipSync(jsonData);

    const key = randomBytes(32);
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    const encryptedData = Buffer.concat([cipher.update(compressedData), cipher.final()]);

    // 3. バックアップファイルを安全なストレージに保存する
    const backupFileName = `backup_${new Date().toISOString()}.enc`;
    writeFileSync(backupFileName, encryptedData);

    // 4. バックアップ完了通知を管理者に送信する
    const transporter = nodemailer.createTransport({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'your-email@example.com',
        pass: 'your-password',
      },
    });

    await transporter.sendMail({
      from: 'your-email@example.com',
      to: 'admin@example.com',
      subject: 'データバックアップ完了通知',
      text: `データバックアップが正常に完了しました。
ファイル名: ${backupFileName}`,
    });

    res.status(200).json({ message: 'バックアップが正常に完了しました' });
  } catch (error) {
    console.error('バックアップエラー:', error);
    res.status(500).json({ error: 'バックアップ処理中にエラーが発生しました' });
  }
}