"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button.jsx"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  CheckSquare, 
  Square, 
  Bell, 
  BellOff,
  Mail,
  MailX,
  Globe,
  Gauge
} from "lucide-react"

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

interface UserPreferencesProps {
  isOpen: boolean
  onClose: () => void
}

export function UserPreferences({ isOpen, onClose }: UserPreferencesProps) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    quiz_mode_preference: "standard",
    auto_play_videos: true,
    auto_mark_complete: false,
    playback_speed: 100,
    track_time_spent: true,
    track_interactions: true,
    email_progress_updates: true,
    reminder_notifications: true,
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Fetch user preferences on mount
  useEffect(() => {
    if (isOpen) {
      fetchPreferences()
    }
  }, [isOpen])

  const fetchPreferences = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user-preferences', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setPreferences(data)
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/user-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(preferences)
      })
      
      if (response.ok) {
        // Show success message or close modal
        onClose()
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setSaving(false)
    }
  }

  const updatePreference = <K extends keyof UserPreferences>(
    key: K, 
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Learning Preferences</h2>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading preferences...</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Quiz Mode */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                Quiz Mode
              </h3>
              <div className="flex gap-3">
                <Button
                  variant={preferences.quiz_mode_preference === "standard" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updatePreference("quiz_mode_preference", "standard")}
                >
                  Standard
                </Button>
                <Button
                  variant={preferences.quiz_mode_preference === "immersive" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updatePreference("quiz_mode_preference", "immersive")}
                >
                  Immersive
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                Choose your preferred quiz interface. Immersive mode provides a distraction-free experience.
              </p>
            </div>

            {/* Video Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Play className="h-5 w-5 text-blue-600" />
                Video Settings
              </h3>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {preferences.auto_play_videos ? (
                    <Volume2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <VolumeX className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">Auto-play Videos</p>
                    <p className="text-sm text-gray-600">Automatically start videos when you enter a lesson</p>
                  </div>
                </div>
                <Button
                  variant={preferences.auto_play_videos ? "default" : "outline"}
                  size="sm"
                  onClick={() => updatePreference("auto_play_videos", !preferences.auto_play_videos)}
                >
                  {preferences.auto_play_videos ? "On" : "Off"}
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Gauge className="h-4 w-4" />
                  Playback Speed: {preferences.playback_speed}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="25"
                  value={preferences.playback_speed}
                  onChange={(e) => updatePreference("playback_speed", parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0.5x</span>
                  <span>1x</span>
                  <span>1.5x</span>
                  <span>2x</span>
                </div>
              </div>
            </div>

            {/* Learning Behavior */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Square className="h-5 w-5 text-blue-600" />
                Learning Behavior
              </h3>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {preferences.auto_mark_complete ? (
                    <CheckSquare className="h-5 w-5 text-green-600" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">Auto-mark Complete</p>
                    <p className="text-sm text-gray-600">Automatically mark lessons as complete when you finish them</p>
                  </div>
                </div>
                <Button
                  variant={preferences.auto_mark_complete ? "default" : "outline"}
                  size="sm"
                  onClick={() => updatePreference("auto_mark_complete", !preferences.auto_mark_complete)}
                >
                  {preferences.auto_mark_complete ? "On" : "Off"}
                </Button>
              </div>
            </div>

            {/* Privacy & Analytics */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Privacy & Analytics
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Track Time Spent</p>
                    <p className="text-sm text-gray-600">Help us improve by tracking your learning time</p>
                  </div>
                  <Button
                    variant={preferences.track_time_spent ? "default" : "outline"}
                    size="sm"
                    onClick={() => updatePreference("track_time_spent", !preferences.track_time_spent)}
                  >
                    {preferences.track_time_spent ? "On" : "Off"}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Track Interactions</p>
                    <p className="text-sm text-gray-600">Track clicks and interactions for analytics</p>
                  </div>
                  <Button
                    variant={preferences.track_interactions ? "default" : "outline"}
                    size="sm"
                    onClick={() => updatePreference("track_interactions", !preferences.track_interactions)}
                  >
                    {preferences.track_interactions ? "On" : "Off"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                Notifications
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {preferences.email_progress_updates ? (
                      <Mail className="h-5 w-5 text-green-600" />
                    ) : (
                      <MailX className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">Email Progress Updates</p>
                      <p className="text-sm text-gray-600">Receive weekly progress summaries via email</p>
                    </div>
                  </div>
                  <Button
                    variant={preferences.email_progress_updates ? "default" : "outline"}
                    size="sm"
                    onClick={() => updatePreference("email_progress_updates", !preferences.email_progress_updates)}
                  >
                    {preferences.email_progress_updates ? "On" : "Off"}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {preferences.reminder_notifications ? (
                      <Bell className="h-5 w-5 text-green-600" />
                    ) : (
                      <BellOff className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">Reminder Notifications</p>
                      <p className="text-sm text-gray-600">Get reminders to continue your learning</p>
                    </div>
                  </div>
                  <Button
                    variant={preferences.reminder_notifications ? "default" : "outline"}
                    size="sm"
                    onClick={() => updatePreference("reminder_notifications", !preferences.reminder_notifications)}
                  >
                    {preferences.reminder_notifications ? "On" : "Off"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={savePreferences} disabled={saving}>
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </div>
    </div>
  )
}
