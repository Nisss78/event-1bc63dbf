"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/supabase';
import Topbar from '@/components/Topbar';
import { FiEdit, FiCalendar } from 'react-icons/fi';

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchUserData();
    fetchUserEvents();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUser(data);
        setName(data.name);
        setEmail(data.email);
      }
    } catch (error) {
      setError('ユーザーデータの取得に失敗しました');
      console.error('Error fetching user data:', error);
    }
  };

  const fetchUserEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('participants')
          .select('events(*)')
          .eq('user_id', user.id)
          .eq('status', '参加予定');

        if (error) throw error;
        setEvents(data.map((item: any) => item.events));
      }
    } catch (error) {
      setError('イベントデータの取得に失敗しました');
      console.error('Error fetching user events:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ name, email })
        .eq('id', user.id);

      if (error) throw error;
      setIsEditing(false);
      fetchUserData();
    } catch (error) {
      setError('プロフィールの更新に失敗しました');
      console.error('Error updating profile:', error);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen h-full bg-gray-100 flex flex-col">
        <Topbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen h-full bg-gray-100 flex flex-col">
        <Topbar />
        <div className="flex-grow flex items-center justify-center">
          <p>ローディング中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-full bg-gray-100 flex flex-col">
      <Topbar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">プロフィール</h1>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="flex items-center text-blue-500 hover:text-blue-600"
              >
                <FiEdit className="mr-1" />
                編集
              </button>
            )}
          </div>
          {isEditing ? (
            <div>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  名前
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  メールアドレス
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                保存
              </button>
            </div>
          ) : (
            <div>
              <p className="mb-2"><strong>名前:</strong> {user.name}</p>
              <p><strong>メールアドレス:</strong> {user.email}</p>
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">参加予定イベント</h2>
          {events.length > 0 ? (
            <ul>
              {events.map((event) => (
                <li key={event.id} className="mb-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <FiCalendar className="text-blue-500 mr-2" />
                    <h3 className="font-semibold">{event.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(event.start_datetime).toLocaleString()} ～ {new Date(event.end_datetime).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{event.location}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>参加予定のイベントはありません。</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;