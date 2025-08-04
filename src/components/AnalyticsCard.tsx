"use client"

import { useState, useEffect } from "react"
import CardWrapper from "./ui/CardWrapper"
import { getBasicAnalytics } from "@/src/utils/analytics"

export default function AnalyticsCard() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAnalytics = async () => {
      const data = await getBasicAnalytics()
      setAnalytics(data)
      setLoading(false)
    }
    loadAnalytics()
  }, [])

  if (loading) {
    return (
      <CardWrapper color="white">
        <div className="text-center py-8">Loading analytics...</div>
      </CardWrapper>
    )
  }

  return (
    <CardWrapper color="white">
      <h2 className="text-xl font-bold mb-4">📊 Basic Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{analytics?.totalUsers || 0}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{analytics?.todayActiveUsers || 0}</div>
          <div className="text-sm text-gray-600">Today's Active Users</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{analytics?.featureUsage?.length || 0}</div>
          <div className="text-sm text-gray-600">Actions This Week</div>
        </div>
      </div>
    </CardWrapper>
  )
}