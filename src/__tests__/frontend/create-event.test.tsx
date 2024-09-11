import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import CreateEvent from '@/app/create-event/page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('axios');

describe('CreateEvent コンポーネント', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
  });

  it('フォームが正しく表示されること', () => {
    render(<CreateEvent />);
    
    expect(screen.getByLabelText('イベント名')).toBeInTheDocument();
    expect(screen.getByLabelText('開催日時')).toBeInTheDocument();
    expect(screen.getByLabelText('場所')).toBeInTheDocument();
    expect(screen.getByLabelText('詳細情報')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '作成' })).toBeInTheDocument();
  });

  it('フォームに入力できること', () => {
    render(<CreateEvent />);
    
    fireEvent.change(screen.getByLabelText('イベント名'), { target: { value: 'テストイベント' } });
    fireEvent.change(screen.getByLabelText('開催日時'), { target: { value: '2023-06-01T12:00' } });
    fireEvent.change(screen.getByLabelText('場所'), { target: { value: '東京都渋谷区' } });
    fireEvent.change(screen.getByLabelText('詳細情報'), { target: { value: 'テストイベントの詳細情報です。' } });

    expect(screen.getByLabelText('イベント名')).toHaveValue('テストイベント');
    expect(screen.getByLabelText('開催日時')).toHaveValue('2023-06-01T12:00');
    expect(screen.getByLabelText('場所')).toHaveValue('東京都渋谷区');
    expect(screen.getByLabelText('詳細情報')).toHaveValue('テストイベントの詳細情報です。');
  });

  it('フォーム送信時にAPIが呼び出されること', async () => {
    (axios.post as jest.Mock).mockResolvedValue({ data: { id: '123' } });
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    render(<CreateEvent />);
    
    fireEvent.change(screen.getByLabelText('イベント名'), { target: { value: 'テストイベント' } });
    fireEvent.change(screen.getByLabelText('開催日時'), { target: { value: '2023-06-01T12:00' } });
    fireEvent.change(screen.getByLabelText('場所'), { target: { value: '東京都渋谷区' } });
    fireEvent.change(screen.getByLabelText('詳細情報'), { target: { value: 'テストイベントの詳細情報です。' } });

    fireEvent.click(screen.getByRole('button', { name: '作成' }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/events', {
        name: 'テストイベント',
        datetime: '2023-06-01T12:00',
        location: '東京都渋谷区',
        description: 'テストイベントの詳細情報です。'
      });
      expect(mockPush).toHaveBeenCalledWith('/events/123');
    });
  });

  it('フォームが空の場合にエラーが表示されること', async () => {
    render(<CreateEvent />);
    
    fireEvent.click(screen.getByRole('button', { name: '作成' }));

    await waitFor(() => {
      expect(screen.getByText('イベント名は必須です')).toBeInTheDocument();
      expect(screen.getByText('開催日時は必須です')).toBeInTheDocument();
      expect(screen.getByText('場所は必須です')).toBeInTheDocument();
    });
  });

  it('API呼び出しが失敗した場合にエラーが表示されること', async () => {
    (axios.post as jest.Mock).mockRejectedValue(new Error('API エラー'));

    render(<CreateEvent />);
    
    fireEvent.change(screen.getByLabelText('イベント名'), { target: { value: 'テストイベント' } });
    fireEvent.change(screen.getByLabelText('開催日時'), { target: { value: '2023-06-01T12:00' } });
    fireEvent.change(screen.getByLabelText('場所'), { target: { value: '東京都渋谷区' } });
    fireEvent.change(screen.getByLabelText('詳細情報'), { target: { value: 'テストイベントの詳細情報です。' } });

    fireEvent.click(screen.getByRole('button', { name: '作成' }));

    await waitFor(() => {
      expect(screen.getByText('イベントの作成に失敗しました。もう一度お試しください。')).toBeInTheDocument();
    });
  });
});