import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EventList from '@/app/events/page';
import axios from 'axios';

jest.mock('axios');

const mockEvents = [
  { id: '1', name: 'イベント1', start_datetime: '2023-06-01T10:00:00Z', end_datetime: '2023-06-01T12:00:00Z' },
  { id: '2', name: 'イベント2', start_datetime: '2023-06-02T14:00:00Z', end_datetime: '2023-06-02T16:00:00Z' },
];

describe('EventList', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockEvents });
  });

  test('イベントリストが正しく表示されること', async () => {
    render(<EventList />);

    await waitFor(() => {
      expect(screen.getByText('イベント1')).toBeInTheDocument();
      expect(screen.getByText('イベント2')).toBeInTheDocument();
    });
  });

  test('新規イベント作成ボタンがクリックできること', () => {
    render(<EventList />);
    
    const createButton = screen.getByText('新規イベント作成');
    fireEvent.click(createButton);

    expect(mockNextRouter.push).toHaveBeenCalledWith('/events/create');
  });

  test('カレンダー表示切り替えボタンがクリックできること', () => {
    render(<EventList />);
    
    const calendarButton = screen.getByText('カレンダー表示');
    fireEvent.click(calendarButton);

    expect(mockNextRouter.push).toHaveBeenCalledWith('/events/calendar');
  });

  test('イベントをクリックすると詳細画面に遷移すること', async () => {
    render(<EventList />);

    await waitFor(() => {
      const eventItem = screen.getByText('イベント1');
      fireEvent.click(eventItem);
    });

    expect(mockNextRouter.push).toHaveBeenCalledWith('/events/1');
  });

  test('エラーが発生した場合にエラーメッセージが表示されること', async () => {
    axios.get.mockRejectedValue(new Error('エラーが発生しました'));

    render(<EventList />);

    await waitFor(() => {
      expect(screen.getByText('イベントの取得中にエラーが発生しました')).toBeInTheDocument();
    });
  });
});