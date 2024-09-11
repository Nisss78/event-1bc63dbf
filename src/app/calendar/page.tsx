"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { FaCalendarAlt, FaList, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Topbar from '@/components/Topbar';

moment.locale('ja');
const localizer = momentLocalizer(moment);

const Calendar = () => {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isListView, setIsListView] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/events', {
        params: {
          start: moment(currentDate).startOf('month').toISOString(),
          end: moment(currentDate).endOf('month').toISOString(),
        },
      });
      setEvents(response.data.map(event => ({
        ...event,
        start: new Date(event.start_datetime),
        end: new Date(event.end_datetime),
      })));
    } catch (error) {
      console.error('イベントの取得に失敗しました', error);
      setEvents([
        {
          id: '1',
          name: 'サンプルイベント1',
          start: new Date(2023, 5, 10, 10, 0),
          end: new Date(2023, 5, 10, 12, 0),
        },
        {
          id: '2',
          name: 'サンプルイベント2',
          start: new Date(2023, 5, 15, 14, 0),
          end: new Date(2023, 5, 15, 16, 0),
        },
      ]);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleClosePopup = () => {
    setSelectedEvent(null);
  };

  const handleViewChange = () => {
    setIsListView(!isListView);
  };

  const handlePrevMonth = () => {
    setCurrentDate(moment(currentDate).subtract(1, 'month').toDate());
  };

  const handleNextMonth = () => {
    setCurrentDate(moment(currentDate).add(1, 'month').toDate());
  };

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">カレンダー</h1>
        <div className="flex justify-between items-center mb-4">
          <div>
            <button onClick={handlePrevMonth} className="mr-2 p-2 bg-blue-500 text-white rounded">
              <FaChevronLeft />
            </button>
            <span className="text-xl font-semibold">
              {moment(currentDate).format('YYYY年 M月')}
            </span>
            <button onClick={handleNextMonth} className="ml-2 p-2 bg-blue-500 text-white rounded">
              <FaChevronRight />
            </button>
          </div>
          <button
            onClick={handleViewChange}
            className="p-2 bg-green-500 text-white rounded flex items-center"
          >
            {isListView ? <FaCalendarAlt className="mr-2" /> : <FaList className="mr-2" />}
            {isListView ? 'カレンダー表示' : 'リスト表示'}
          </button>
        </div>
        {isListView ? (
          <div className="bg-white rounded shadow p-4">
            <h2 className="text-2xl font-semibold mb-4">イベントリスト</h2>
            <ul>
              {events.map((event) => (
                <li key={event.id} className="mb-2 p-2 border-b border-gray-200">
                  <span className="font-semibold">{event.name}</span>
                  <br />
                  <span className="text-sm text-gray-600">
                    {moment(event.start).format('YYYY/MM/DD HH:mm')} - {moment(event.end).format('HH:mm')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white rounded shadow p-4">
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
              onSelectEvent={handleEventClick}
              messages={{
                next: "次へ",
                previous: "前へ",
                today: "今日",
                month: "月",
                week: "週",
                day: "日"
              }}
            />
          </div>
        )}
      </div>
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-lg max-w-md">
            <h2 className="text-2xl font-semibold mb-2">イベント詳細</h2>
            <p><strong>イベント名:</strong> {selectedEvent.name}</p>
            <p><strong>開始:</strong> {moment(selectedEvent.start).format('YYYY/MM/DD HH:mm')}</p>
            <p><strong>終了:</strong> {moment(selectedEvent.end).format('YYYY/MM/DD HH:mm')}</p>
            <button
              onClick={handleClosePopup}
              className="mt-4 p-2 bg-red-500 text-white rounded"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;