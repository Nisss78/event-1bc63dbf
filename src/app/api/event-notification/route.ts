import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { supabase } from '@/supabase';

export default async function handleEventNotification(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  const { eventId, changes } = req.body;

  if (!eventId) {
    return res.status(400).json({ error: 'イベントIDが提供されていません' });
  }

  if (!changes || Object.keys(changes).length === 0) {
    return res.status(400).json({ error: '変更内容が提供されていません' });
  }

  try {
    // イベント情報を取得
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError) {
      throw new Error('イベント情報の取得中にエラーが発生しました');
    }

    // 参加者リストを取得
    const { data: participants, error: participantsError } = await supabase
      .from('participants')
      .select('user_id')
      .eq('event_id', eventId)
      .eq('status', '参加予定');

    if (participantsError) {
      throw new Error('参加者リストの取得中にエラーが発生しました');
    }

    // 参加者のメールアドレスを取得
    const userIds = participants.map(p => p.user_id);
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('email')
      .in('id', userIds);

    if (usersError) {
      throw new Error('ユーザー情報の取得中にエラーが発生しました');
    }

    // メール送信の設定
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 変更内容を文字列に変換
    const changesText = Object.entries(changes)
      .map(([key, value]) => `${key}: ${value}`)
      .join('
');

    // メール本文を作成
    const mailOptions = {
      from: process.env.MAIL_FROM,
      subject: `イベント「${event.name}」の更新通知`,
      text: `
        イベント「${event.name}」の詳細が更新されました。

        更新内容:
        ${changesText}

        更新後のイベント詳細:
        名前: ${event.name}
        説明: ${event.description}
        開始日時: ${event.start_datetime}
        終了日時: ${event.end_datetime}
        場所: ${event.location}

        ご確認ください。
      `,
    };

    // 各参加者にメールを送信
    for (const user of users) {
      await transporter.sendMail({
        ...mailOptions,
        to: user.email,
      });
    }

    res.status(200).json({ message: 'イベント通知が正常に送信されました' });
  } catch (error) {
    console.error('イベント通知送信中のエラー:', error);
    res.status(500).json({ error: 'イベント通知の送信中にエラーが発生しました' });
  }
}