"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { FiSave, FiTrash2 } from 'react-icons/fi'
import Topbar from '@/components/Topbar'

const EditEventPage = ({ params }: { params: { eventId: string } }) => {
  const router = useRouter()
  const [event, setEvent] = useState({
    name: '',
    startDatetime: '',
    location: '',
    description: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`/api/events/${params.eventId}`)
        setEvent(response.data)
      } catch (error) {
        setError('イベント情報の取得に失敗しました。')
      }
    }
    fetchEvent()
  }, [params.eventId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEvent(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdate = async () => {
    try {
      await axios.put(`/api/events/${params.eventId}`, event)
      router.push(`/events/${params.eventId}`)
    } catch (error) {
      setError('更新中にエラーが発生しました。')
    }
  }

  const handleDelete = async () => {
    if (window.confirm('このイベントを削除してもよろしいですか？')) {
      try {
        await axios.delete(`/api/events/${params.eventId}`)
        router.push('/events')
      } catch (error) {
        setError('削除中にエラーが発生しました。')
      }
    }
  }

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">イベント編集</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              イベント名
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              name="name"
              value={event.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDatetime">
              開催日時
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="startDatetime"
              type="datetime-local"
              name="startDatetime"
              value={event.startDatetime}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
              場所
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="location"
              type="text"
              name="location"
              value={event.location}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              詳細情報
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="description"
              name="description"
              value={event.description}
              onChange={handleInputChange}
              rows={4}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              type="button"
              onClick={handleUpdate}
            >
              <FiSave className="mr-2" />
              更新
            </button>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              type="button"
              onClick={handleDelete}
            >
              <FiTrash2 className="mr-2" />
              削除
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditEventPage