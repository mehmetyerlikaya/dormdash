import { supabase } from "@/src/lib/supabase"
import { getDeviceUserId } from "./userIdentification"

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function getDeviceType(): string {
  if (typeof window === 'undefined') return 'unknown'
  const userAgent = navigator.userAgent.toLowerCase()
  if (/mobile|android|iphone|ipad|phone/.test(userAgent)) {
    return 'mobile'
  } else if (/tablet|ipad/.test(userAgent)) {
    return 'tablet'
  } else {
    return 'desktop'
  }
}

function getBrowserInfo(): string {
  if (typeof window === 'undefined') return 'unknown'
  const userAgent = navigator.userAgent
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Edge')) return 'Edge'
  return 'Other'
}

export async function trackUserVisit() {
  try {
    const deviceUserId = getDeviceUserId()
    const sessionId = generateSessionId()
    const deviceType = getDeviceType()
    const browserInfo = getBrowserInfo()
    const { data: existingUser } = await supabase
      .from('user_analytics')
      .select('*')
      .eq('device_user_id', deviceUserId)
      .single()
    if (existingUser) {
      await supabase
        .from('user_analytics')
        .update({
          last_visit_at: new Date().toISOString(),
          total_visits: existingUser.total_visits + 1,
          updated_at: new Date().toISOString()
        })
        .eq('device_user_id', deviceUserId)
    } else {
      await supabase
        .from('user_analytics')
        .insert({
          device_user_id: deviceUserId,
          session_id: sessionId,
          device_type: deviceType,
          browser_info: browserInfo
        })
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('current_session_id', sessionId)
    }
  } catch (error) {
    console.error('Error tracking user visit:', error)
  }
}

export async function trackFeatureUsage(
  featureName: string,
  actionType: string,
  machineId?: string,
  postId?: string,
  metadata?: any
) {
  try {
    const deviceUserId = getDeviceUserId()
    await supabase
      .from('feature_usage')
      .insert({
        device_user_id: deviceUserId,
        feature_name: featureName,
        action_type: actionType,
        machine_id: machineId || null,
        post_id: postId || null,
        metadata: metadata || null
      })
  } catch (error) {
    console.error('Error tracking feature usage:', error)
  }
}

export async function getBasicAnalytics() {
  try {
    const { data: totalUsers } = await supabase
      .from('user_analytics')
      .select('device_user_id', { count: 'exact' })
    const today = new Date().toISOString().split('T')[0]
    const { data: todayUsers } = await supabase
      .from('user_analytics')
      .select('device_user_id')
      .gte('last_visit_at', today)
    const { data: featureUsage } = await supabase
      .from('feature_usage')
      .select('feature_name, action_type')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    return {
      totalUsers: totalUsers?.length || 0,
      todayActiveUsers: todayUsers?.length || 0,
      featureUsage: featureUsage || []
    }
  } catch (error) {
    console.error('Error getting analytics:', error)
    return {
      totalUsers: 0,
      todayActiveUsers: 0,
      featureUsage: []
    }
  }
}