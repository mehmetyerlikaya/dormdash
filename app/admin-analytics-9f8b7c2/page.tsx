"use client"

import { useState, useEffect } from "react"
import { getBasicAnalytics } from "@/src/utils/analytics"
import { supabase } from "@/src/lib/supabase"
import CardWrapper from "@/src/components/ui/CardWrapper"

interface AnalyticsData {
  totalUsers: number
  todayActiveUsers: number
  featureUsage: any[]
  deviceBreakdown: { mobile: number; desktop: number; tablet: number }
  topFeatures: { name: string; count: number }[]
  recentActivity: any[]
  machineUsage: { machineId: string; count: number }[]
  chatActivity: { posts: number; reactions: number }
}

export default function AdminAnalyticsPage() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_ANALYTICS_PASSWORD || "Dorm2024Secret!"
    
    if (password === correctPassword) {
      setIsAuthenticated(true)
      setError("")
    } else {
      setError("Incorrect password")
      setPassword("")
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadAnalytics()
    }
  }, [isAuthenticated])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      // Basic analytics
      const basicAnalytics = await getBasicAnalytics()
      
      // Device breakdown
      const { data: deviceData } = await supabase
        .from('user_analytics')
        .select('device_type')
      
      const deviceBreakdown = {
        mobile: deviceData?.filter(d => d.device_type === 'mobile').length || 0,
        desktop: deviceData?.filter(d => d.device_type === 'desktop').length || 0,
        tablet: deviceData?.filter(d => d.device_type === 'tablet').length || 0
      }

      // Top features
      const featureCounts: { [key: string]: number } = {}
      basicAnalytics.featureUsage.forEach((usage: any) => {
        const key = `${usage.feature_name}_${usage.action_type}`
        featureCounts[key] = (featureCounts[key] || 0) + 1
      })
      
      const topFeatures = Object.entries(featureCounts)
        .map(([key, count]) => ({
          name: key.replace('_', ' ').replace(/([A-Z])/g, ' $1').trim(),
          count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Machine usage
      const { data: machineData } = await supabase
        .from('feature_usage')
        .select('machine_id')
        .not('machine_id', 'is', null)
      
      const machineCounts: { [key: string]: number } = {}
      machineData?.forEach((usage: any) => {
        machineCounts[usage.machine_id] = (machineCounts[usage.machine_id] || 0) + 1
      })
      
      const machineUsage = Object.entries(machineCounts)
        .map(([machineId, count]) => ({ machineId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Chat activity
      const { data: chatPosts } = await supabase
        .from('anonymous_posts')
        .select('id')
        .eq('is_deleted', false)
      
      const { data: chatReactions } = await supabase
        .from('post_reactions')
        .select('id')

      const chatActivity = {
        posts: chatPosts?.length || 0,
        reactions: chatReactions?.length || 0
      }

      // Recent activity (last 10 feature usages)
      const { data: recentActivity } = await supabase
        .from('feature_usage')
        .select('feature_name, action_type, created_at')
        .order('created_at', { ascending: false })
        .limit(10)

      setAnalytics({
        ...basicAnalytics,
        deviceBreakdown,
        topFeatures,
        machineUsage,
        chatActivity,
        recentActivity: recentActivity || []
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">🔐 Admin Access</h1>
            <p className="text-gray-600">Enter password to access analytics dashboard</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Dorm Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into dorm app usage</p>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <CardWrapper color="white">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{analytics?.totalUsers || 0}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
          </CardWrapper>

          <CardWrapper color="white">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{analytics?.todayActiveUsers || 0}</div>
              <div className="text-sm text-gray-600">Active Today</div>
            </div>
          </CardWrapper>

          <CardWrapper color="white">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{analytics?.featureUsage?.length || 0}</div>
              <div className="text-sm text-gray-600">Actions This Week</div>
            </div>
          </CardWrapper>

          <CardWrapper color="white">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{analytics?.chatActivity?.posts || 0}</div>
              <div className="text-sm text-gray-600">Chat Posts</div>
            </div>
          </CardWrapper>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Device Breakdown */}
          <CardWrapper color="white">
            <h2 className="text-xl font-bold mb-4">📱 Device Types</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Mobile</span>
                <span className="font-semibold">{analytics?.deviceBreakdown?.mobile || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Desktop</span>
                <span className="font-semibold">{analytics?.deviceBreakdown?.desktop || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tablet</span>
                <span className="font-semibold">{analytics?.deviceBreakdown?.tablet || 0}</span>
              </div>
            </div>
          </CardWrapper>

          {/* Top Features */}
          <CardWrapper color="white">
            <h2 className="text-xl font-bold mb-4">🔥 Top Features</h2>
            <div className="space-y-3">
              {analytics?.topFeatures?.map((feature, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{feature.name}</span>
                  <span className="font-semibold">{feature.count}</span>
                </div>
              ))}
            </div>
          </CardWrapper>

          {/* Machine Usage */}
          <CardWrapper color="white">
            <h2 className="text-xl font-bold mb-4">👕 Top Machines</h2>
            <div className="space-y-3">
              {analytics?.machineUsage?.map((machine, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{machine.machineId}</span>
                  <span className="font-semibold">{machine.count} uses</span>
                </div>
              ))}
            </div>
          </CardWrapper>

          {/* Chat Activity */}
          <CardWrapper color="white">
            <h2 className="text-xl font-bold mb-4">💬 Chat Activity</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Posts</span>
                <span className="font-semibold">{analytics?.chatActivity?.posts || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Reactions</span>
                <span className="font-semibold">{analytics?.chatActivity?.reactions || 0}</span>
              </div>
            </div>
          </CardWrapper>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <CardWrapper color="white">
            <h2 className="text-xl font-bold mb-4">⏰ Recent Activity</h2>
            <div className="space-y-2">
              {analytics?.recentActivity?.map((activity, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <span className="font-medium">{activity.feature_name}</span>
                    <span className="text-gray-500 ml-2">({activity.action_type})</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(activity.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardWrapper>
        </div>
      </div>
    </div>
  )
} 