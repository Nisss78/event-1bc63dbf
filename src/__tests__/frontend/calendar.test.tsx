import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Calendar from '@/app/calendar/page';
import { useRouter } from 'next/navigation';
import axios from 'axios';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('axios');

const mockEvents = [
  {
    id: '1',
    name: 'テストイベント1',
    start_datetime: '2023-06-01T10:00:00Z',
    end_datetime: '2023-06-01T12:00:00Z',
  },
  {
    id: '2',
    name: 'テストイベント2',
    start_datetime: '2023-06-15T14:00:00Z',
    end_datetime: '2023-06-15T16:00:00Z',
  },
];

describe('カレンダー画面', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
    (axios.get as jest.Mock).mockResolvedValue({ data: mockEvents });
  });

  test('カレンダーが正しく表示される', async () => {
    render(<Calendar />);
    await waitFor(() => {
      expect(screen.getByText('カレンダー')).toBeInTheDocument();
    });
  });

  test('イベントがカレンダーに表示される', async () => {
    render(<Calendar />);
    await waitFor(() => {
      expect(screen.getByText('テストイベント1')).toBeInTheDocument();
      expect(screen.getByText('テストイベント2')).toBeInTheDocument();
    });
  });

  test('イベントをクリックするとポップアップが表示される', async () => {
    render(<Calendar />);
    await waitFor(() => {
      fireEvent.click(screen.getByText('テストイベント1'));
    });
    expect(screen.getByText('イベント詳細')).toBeInTheDocument();
  });

  test('月切り替えボタンで表示月が変更される', async () => {
    render(<Calendar />);
    await waitFor(() => {
      fireEvent.click(screen.getByText('次の月'));
    });
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  test('リスト表示切り替えボタンでリスト形式に切り替わる', async () => {
    render(<Calendar />);
    await waitFor(() => {
      fireEvent.click(screen.getByText('リスト表示'));
    });
    expect(screen.getByText('イベントリスト')).toBeInTheDocument();
  });
});