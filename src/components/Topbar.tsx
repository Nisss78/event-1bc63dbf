use client

import React, { useState } from 'react';
import Link from 'next/link';
import { FaCalendarAlt, FaUser, FaBars, FaTimes } from 'react-icons/fa';

const Topbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/events" className="text-2xl font-bold">
          イベント管理システム
        </Link>

        <div className="hidden md:flex space-x-4">
          <Link href="/events" className="hover:text-blue-200">
            イベント一覧
          </Link>
          <Link href="/create-event" className="hover:text-blue-200">
            イベント作成
          </Link>
          <Link href="/calendar" className="hover:text-blue-200">
            <FaCalendarAlt className="inline mr-1" />
            カレンダー
          </Link>
        </div>

        <div className="hidden md:block">
          <Link href="/profile" className="hover:text-blue-200">
            <FaUser className="inline mr-1" />
            プロフィール
          </Link>
        </div>

        <button
          className="md:hidden text-2xl"
          onClick={toggleMenu}
          aria-label="メニューを開く"
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden mt-4">
          <Link href="/events" className="block py-2 hover:text-blue-200">
            イベント一覧
          </Link>
          <Link href="/create-event" className="block py-2 hover:text-blue-200">
            イベント作成
          </Link>
          <Link href="/calendar" className="block py-2 hover:text-blue-200">
            <FaCalendarAlt className="inline mr-1" />
            カレンダー
          </Link>
          <Link href="/profile" className="block py-2 hover:text-blue-200">
            <FaUser className="inline mr-1" />
            プロフィール
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Topbar;