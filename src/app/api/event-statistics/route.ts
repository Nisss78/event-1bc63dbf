import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/supabase';

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get('eventId');

  if (!eventId) {
    return NextResponse.json({ error: 'イベントIDが指定されていません' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('participants')
      .select('status')
      .eq('event_id', eventId)
      .execute();

    if (error) {
      throw error;
    }

    const statistics = {
      participantsCount: 0,
      cancelledCount: 0,
      pendingCount: 0,
      totalCount: data.length,
    };

    data.forEach((participant) => {
      switch (participant.status) {
        case '参加予定':
          statistics.participantsCount++;
          break;
        case 'cancelled':
          statistics.cancelledCount++;
          break;
        case 'pending':
          statistics.pendingCount++;
          break;
      }
    });

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('イベント統計の取得中にエラーが発生しました:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ error: 'メソッドが許可されていません' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'メソッドが許可されていません' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'メソッドが許可されていません' }, { status: 405 });
}