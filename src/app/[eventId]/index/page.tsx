"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { FaEdit, FaUser, FaCalendar, FaMapMarkerAlt } from 'react-icons/fa';
import Topbar from '@/components/Topbar';

const EventDetailPage = ({ params }: { params: { eventId: string } }) => {
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [participationStatus, setParticipationStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventResponse = await axios.get(`/api/events/${params.eventId}`);
        setEvent(eventResponse.data);

        const participantsResponse = await axios.get(`/api/events/${params.eventId}/participants`);
        setParticipants(participantsResponse.data);

        const statusResponse = await axios.get(`/api/events/${params.eventId}/participation-status`);
        setParticipationStatus(statusResponse.data.status);
      } catch (error) {
        setError('イベント情報の取得に失敗しました');
      }
    };

    fetchEventDetails();
  }, [params.eventId]);

  const handleParticipation = async () => {
    try {
      const newStatus = participationStatus === '参加予定' ? '不参加' : '参加予定';
      const response = await axios.post(`/api/events/${params.eventId}/participate`, { status: newStatus });
      setParticipationStatus(response.data.status);
    } catch (error) {
      setError('参加状況の更新に失敗しました');
    }
  };

  const handleEdit = () => {
    router.push(`/events/${params.eventId}/edit`);
  };

  if (error) {
    return <div className="text-red-500">エラーが発生しました: {error}</div>;
  }

  if (!event) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">{event.name}</h1>
            <p className="text-gray-600 mb-4">{event.description}</p>
            <div className="flex items-center mb-2">
              <FaCalendar className="mr-2 text-blue-500" />
              <span>{format(new Date(event.start_datetime), 'yyyy年M月d日 HH:mm', { locale: ja })} - {format(new Date(event.end_datetime), 'HH:mm', { locale: ja })}</span>
            </div>
            <div className="flex items-center mb-4">
              <FaMapMarkerAlt className="mr-2 text-red-500" />
              <span>{event.location}</span>
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={handleParticipation}
                className={`px-4 py-2 rounded-full font-bold ${
                  participationStatus === '参加予定' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                }`}
              >
                {participationStatus === '参加予定' ? '参加をキャンセル' : '参加する'}
              </button>
              <button
                onClick={handleEdit}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-full font-bold"
              >
                <FaEdit className="mr-2" />
                編集
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">参加者リスト</h2>
            <ul>
              {participants.map((participant) => (
                <li key={participant.id} className="flex items-center mb-2">
                  <FaUser className="mr-2 text-gray-500" />
                  <span>{participant.name}</span>
                  <span className="ml-2 text-sm text-gray-500">({participant.status})</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;