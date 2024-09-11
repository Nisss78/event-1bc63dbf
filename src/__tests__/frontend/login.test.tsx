import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '@/app/login/page';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('ログイン画面', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
  });

  test('ユーザー名とパスワードの入力フィールドが表示される', () => {
    render(<Login />);
    expect(screen.getByLabelText('ユーザー名')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
  });

  test('ログインボタンが表示される', () => {
    render(<Login />);
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
  });

  test('ユーザー名とパスワードを入力してログインボタンをクリックするとログイン処理が実行される', async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    render(<Login />);

    fireEvent.change(screen.getByLabelText('ユーザー名'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/home');
    });
  });

  test('ユーザー名が空の場合にエラーメッセージが表示される', async () => {
    render(<Login />);

    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(screen.getByText('ユーザー名を入力してください')).toBeInTheDocument();
    });
  });

  test('パスワードが空の場合にエラーメッセージが表示される', async () => {
    render(<Login />);

    fireEvent.change(screen.getByLabelText('ユーザー名'), { target: { value: 'testuser' } });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(screen.getByText('パスワードを入力してください')).toBeInTheDocument();
    });
  });

  test('ログイン失敗時にエラーメッセージが表示される', async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    global.fetch = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'ログインに失敗しました' }),
      })
    );

    render(<Login />);

    fireEvent.change(screen.getByLabelText('ユーザー名'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('パスワード'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    await waitFor(() => {
      expect(screen.getByText('ログインに失敗しました')).toBeInTheDocument();
    });
  });
});