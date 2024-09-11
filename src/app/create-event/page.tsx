"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Topbar from '@/components/Topbar';
import { FiCalendar, FiMapPin, FiInfo } from 'react-icons/fi';

const CreateEvent = () => {
  const router = useRouter();
  const [eventName, setEventName] = useState('');
  const [eventDateTime, setEventDateTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    if (!eventName) newErrors.eventName = 'イベント名は必須です';
    if (!eventDateTime) newErrors.eventDateTime = '開催日時は必須です';
    if (!eventLocation) newErrors.eventLocation = '場所は必須です';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await axios.post('/api/events', {
        name: eventName,
        datetime: eventDateTime,
        location: eventLocation,
        description: eventDescription
      });
      router.push(`/events/${response.data.id}`);
    } catch (error) {
      setApiError('イベントの作成に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">イベント作成</h1>
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eventName">
              イベント名
            </label>
            <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.eventName ? 'border-red-500' : ''}`}
              id="eventName"
              type="text"
              placeholder="イベント名"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
            {errors.eventName && <p className="text-red-500 text-xs italic">{errors.eventName}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eventDateTime">
              開催日時
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="text-gray-400" />
              </div>
              <input
                className={`shadow appearance-none border rounded w-full py-2 pl-10 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.eventDateTime ? 'border-red-500' : ''}`}
                id="eventDateTime"
                type="datetime-local"
                value={eventDateTime}
                onChange={(e) => setEventDateTime(e.target.value)}
              />
            </div>
            {errors.eventDateTime && <p className="text-red-500 text-xs italic">{errors.eventDateTime}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eventLocation">
              場所
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMapPin className="text-gray-400" />
              </div>
              <input
                className={`shadow appearance-none border rounded w-full py-2 pl-10 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.eventLocation ? 'border-red-500' : ''}`}
                id="eventLocation"
                type="text"
                placeholder="開催場所"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
              />
            </div>
            {errors.eventLocation && <p className="text-red-500 text-xs italic">{errors.eventLocation}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eventDescription">
              詳細情報
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                <FiInfo className="text-gray-400" />
              </div>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 pl-10 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                id="eventDescription"
                placeholder="イベントの詳細情報"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
              />
            </div>
          </div>
          {apiError && <p className="text-red-500 text-sm mb-4">{apiError}</p>}
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              作成
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;