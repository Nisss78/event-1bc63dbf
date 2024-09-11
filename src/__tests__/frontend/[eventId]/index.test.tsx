import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import EventDetailPage from '@/app/[eventId]/index/page';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockEvent = {
  id: '1',
  name: 'テストイベント',
  description: 'これはテストイベントです',
  start_datetime: '2023-06-01T10:00:00Z',
  end_datetime: '2023-06-01T12:00:00Z',
  location: '東京都渋谷区',
};

const mockParticipants = [
  { id: '1', name: '参加者1', status: '参加予定' },
  { id: '2', name: '参加者2', status: '不参加' },
];

describe('EventDetailPage', () => {
  beforeEach(() => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockEvent });
    mockedAxios.get.mockResolvedValueOnce({ data: mockParticipants });
  });

  it('イベント情報が正しく表示される', async () => {
    render(<EventDetailPage params={{ eventId: '1' }} />);

    await waitFor(() => {
      expect(screen.getByText('テストイベント')).toBeInTheDocument();
      expect(screen.getByText('これはテストイベントです')).toBeInTheDocument();
      expect(screen.getByText('2023年6月1日 10:00 - 12:00')).toBeInTheDocument();
      expect(screen.getByText('東京都渋谷区')).toBeInTheDocument();
    });
  });

  it('参加者リストが正しく表示される', async () => {
    render(<EventDetailPage params={{ eventId: '1' }} />);

    await waitFor(() => {
      expect(screen.getByText('参加者1')).toBeInTheDocument();
      expect(screen.getByText('参加者2')).toBeInTheDocument();
    });
  });

  it('参加ボタンをクリックすると参加状況が更新される', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { status: '参加予定' } });

    render(<EventDetailPage params={{ eventId: '1' }} />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('参加する'));
    });

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/events/1/participate', { status: '参加予定' });
      expect(screen.getByText('参加をキャンセル')).toBeInTheDocument();
    });
  });

  it('編集ボタンをクリックするとイベント編集画面に遷移する', async () => {
    render(<EventDetailPage params={{ eventId: '1' }} />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('編集'));
    });

    expect(global.mockNextRouter.push).toHaveBeenCalledWith('/events/1/edit');
  });

  it('エラーが発生した場合はエラーメッセージが表示される', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('イベント情報の取得に失敗しました'));

    render(<EventDetailPage params={{ eventId: '1' }} />);

    await waitFor(() => {
      expect(screen.getByText('エラーが発生しました: イベント情報の取得に失敗しました')).toBeInTheDocument();
    });
  });
});