"use client"

import { useState, useEffect } from "react"

interface UserPreferences {
  quiz_mode_preference: "standard" | "immersive"
  auto_play_videos: boolean
  auto_mark_complete: boolean
  playback_speed: number
  track_time_spent: boolean
  track_interactions: boolean
  email_progress_updates: boolean
  reminder_notifications: boolean
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPreferences = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/user-preferences', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch preferences: ${response.status}`)
      }
      
      const data = await response.json()
      setPreferences(data)
    } catch (err) {
      console.error('Error fetching user preferences:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch preferences')
      
      // Set default preferences on error
      setPreferences({
        quiz_mode_preference: "standard",
        auto_play_videos: true,
        auto_mark_complete: false,
        playback_speed: 100,
        track_time_spent: true,
        track_interactions: true,
        email_progress_updates: true,
        reminder_notifications: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    try {
      const response = await fetch('/api/user-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newPreferences)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to update preferences: ${response.status}`)
      }
      
      const updatedData = await response.json()
      setPreferences(updatedData)
      
      return true
    } catch (err) {
      console.error('Error updating preferences:', err)
      setError(err instanceof Error ? err.message : 'Failed to update preferences')
      return false
    }
  }

  useEffect(() => {
    fetchPreferences()
  }, [])

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refreshPreferences: fetchPreferences,
    // Helper functions for common preferences
    isImmersiveMode: preferences?.quiz_mode_preference === "immersive",
    shouldAutoPlay: preferences?.auto_play_videos ?? true,
    shouldAutoComplete: preferences?.auto_mark_complete ?? false,
    playbackSpeedMultiplier: (preferences?.playback_speed ?? 100) / 100,
  }
}
