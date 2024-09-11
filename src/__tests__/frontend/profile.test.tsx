import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfilePage from '@/app/profile/page';
import { act } from 'react-dom/test-utils';

// モックデータ
const mockUserProfile = {
  id: '1',
  name: 'テストユーザー',
  email: 'test@example.com',
};

const mockEvents = [
  { id: '1', name: 'テストイベント1', date: '2023-06-01' },
  { id: '2', name: 'テストイベント2', date: '2023-06-15' },
];

// フェッチのモック
global.fetch = jest.fn((url) => {
  if (url.includes('/api/user')) {
    return Promise.resolve({
      json: () => Promise.resolve(mockUserProfile),
      ok: true,
    });
  } else if (url.includes('/api/events')) {
    return Promise.resolve({
      json: () => Promise.resolve(mockEvents),
      ok: true,
    });
  }
  return Promise.reject(new Error('不明なURL'));
}) as jest.Mock;

describe('プロフィール画面', () => {
  it('ユーザー情報とイベントリストが正しく表示される', async () => {
    await act(async () => {
      render(<ProfilePage />);
    });

    expect(screen.getByText('テストユーザー')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('テストイベント1')).toBeInTheDocument();
    expect(screen.getByText('テストイベント2')).toBeInTheDocument();
  });

  it('編集ボタンをクリックするとフォームが表示される', async () => {
    await act(async () => {
      render(<ProfilePage />);
    });

    const editButton = screen.getByText('編集');
    fireEvent.click(editButton);

    expect(screen.getByLabelText('名前')).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
  });

  it('フォームの送信が正しく機能する', async () => {
    await act(async () => {
      render(<ProfilePage />);
    });

    const editButton = screen.getByText('編集');
    fireEvent.click(editButton);

    const nameInput = screen.getByLabelText('名前');
    const emailInput = screen.getByLabelText('メールアドレス');
    const submitButton = screen.getByText('保存');

    fireEvent.change(nameInput, { target: { value: '新しい名前' } });
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ message: '更新成功' }),
        ok: true,
      })
    ) as jest.Mock;

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/user', expect.any(Object));
    });
  });

  it('エラー時にエラーメッセージが表示される', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('ネットワークエラー'))
    ) as jest.Mock;

    await act(async () => {
      render(<ProfilePage />);
    });

    await waitFor(() => {
      expect(screen.getByText('データの取得に失敗しました')).toBeInTheDocument();
    });
  });
});