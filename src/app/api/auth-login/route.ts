import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/supabase';

export default async function authLogin(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'メソッドが許可されていません' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'メールアドレスとパスワードが必要です' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    if (data && data.session) {
      return res.status(200).json({ token: data.session.access_token });
    } else {
      return res.status(500).json({ error: '予期せぬエラーが発生しました' });
    }
  } catch (error) {
    console.error('ログインエラー:', error);
    return res.status(500).json({ error: '内部サーバーエラー' });
  }
}