import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import EditEventPage from '@/app/[eventId]/edit/page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('axios');

const mockRouter = {
  push: jest.fn(),
};

describe('イベント編集画面', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        id: '1',
        name: 'テストイベント',
        startDatetime: '2023-06-01T10:00:00',
        location: '東京',
        description: 'テストイベントの詳細',
      },
    });
  });

  it('イベント情報が正しく表示されること', async () => {
    render(<EditEventPage params={{ eventId: '1' }} />);

    await waitFor(() => {
      expect(screen.getByLabelText('イベント名')).toHaveValue('テストイベント');
      expect(screen.getByLabelText('開催日時')).toHaveValue('2023-06-01T10:00:00');
      expect(screen.getByLabelText('場所')).toHaveValue('東京');
      expect(screen.getByLabelText('詳細情報')).toHaveValue('テストイベントの詳細');
    });
  });

  it('イベント情報を更新できること', async () => {
    (axios.put as jest.Mock).mockResolvedValue({ data: { message: '更新成功' } });

    render(<EditEventPage params={{ eventId: '1' }} />);

    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('イベント名'), { target: { value: '更新後のイベント名' } });
      fireEvent.change(screen.getByLabelText('開催日時'), { target: { value: '2023-07-01T11:00:00' } });
      fireEvent.change(screen.getByLabelText('場所'), { target: { value: '大阪' } });
      fireEvent.change(screen.getByLabelText('詳細情報'), { target: { value: '更新後の詳細情報' } });
    });

    fireEvent.click(screen.getByText('更新'));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('/api/events/1', {
        name: '更新後のイベント名',
        startDatetime: '2023-07-01T11:00:00',
        location: '大阪',
        description: '更新後の詳細情報',
      });
      expect(mockRouter.push).toHaveBeenCalledWith('/events/1');
    });
  });

  it('イベントを削除できること', async () => {
    (axios.delete as jest.Mock).mockResolvedValue({ data: { message: '削除成功' } });

    render(<EditEventPage params={{ eventId: '1' }} />);

    fireEvent.click(screen.getByText('削除'));

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('/api/events/1');
      expect(mockRouter.push).toHaveBeenCalledWith('/events');
    });
  });

  it('更新時にエラーが発生した場合、エラーメッセージが表示されること', async () => {
    (axios.put as jest.Mock).mockRejectedValue(new Error('更新エラー'));

    render(<EditEventPage params={{ eventId: '1' }} />);

    fireEvent.click(screen.getByText('更新'));

    await waitFor(() => {
      expect(screen.getByText('更新中にエラーが発生しました。')).toBeInTheDocument();
    });
  });

  it('削除時にエラーが発生した場合、エラーメッセージが表示されること', async () => {
    (axios.delete as jest.Mock).mockRejectedValue(new Error('削除エラー'));

    render(<EditEventPage params={{ eventId: '1' }} />);

    fireEvent.click(screen.getByText('削除'));

    await waitFor(() => {
      expect(screen.getByText('削除中にエラーが発生しました。')).toBeInTheDocument();
    });
  });
});