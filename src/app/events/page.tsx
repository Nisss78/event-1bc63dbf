"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Topbar from '@/components/Topbar';
import { FaCalendarAlt, FaPlus } from 'react-icons/fa';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('/api/events');
        setEvents(response.data);
      } catch (err) {
        setError('イベントの取得中にエラーが発生しました');
        console.error('Error fetching events:', err);
      }
    };

    fetchEvents();
  }, []);

  const handleEventClick = (eventId) => {
    router.push(`/events/${eventId}`);
  };

  const handleCreateEvent = () => {
    router.push('/events/create');
  };

  const handleCalendarView = () => {
    router.push('/events/calendar');
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">イベント一覧</h1>
          <div className="space-x-4">
            <button
              onClick={handleCreateEvent}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <FaPlus className="mr-2" />
              新規イベント作成
            </button>
            <button
              onClick={handleCalendarView}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <FaCalendarAlt className="mr-2" />
              カレンダー表示
            </button>
          </div>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => handleEventClick(event.id)}
              className="bg-white shadow-md rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow duration-300"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{event.name}</h2>
              <p className="text-gray-600 mb-4">
                {new Date(event.start_datetime).toLocaleString()} - {new Date(event.end_datetime).toLocaleString()}
              </p>
              {event.location && <p className="text-gray-600">場所: {event.location}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventList;