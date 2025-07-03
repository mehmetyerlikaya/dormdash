"use client"

import { useState, useEffect, useRef } from "react"

interface CountdownResult {
  secondsLeft: number
  inGrace: boolean
  graceSecondsLeft: number
}

export default function useCountdown(endAt?: Date, graceEndAt?: Date): CountdownResult {
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [inGrace, setInGrace] = useState(false)
  const [graceSecondsLeft, setGraceSecondsLeft] = useState(0)
  
  // Use refs to track the latest values and prevent stale closures on mobile
  const endAtRef = useRef(endAt)
  const graceEndAtRef = useRef(graceEndAt)
  const lastUpdateRef = useRef(0)

  // Update refs when props change
  useEffect(() => {
    endAtRef.current = endAt
    graceEndAtRef.current = graceEndAt
  }, [endAt, graceEndAt])

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now()
      
      // Prevent excessive updates on mobile (throttling protection)
      if (now - lastUpdateRef.current < 900) {
        return
      }
      lastUpdateRef.current = now

      const currentEndAt = endAtRef.current
      const currentGraceEndAt = graceEndAtRef.current

      if (currentEndAt) {
        const timeLeft = Math.max(0, Math.floor((currentEndAt.getTime() - now) / 1000))
        setSecondsLeft(timeLeft)

        // Check if we're in grace period
        if (currentGraceEndAt) {
          const graceLeft = Math.max(0, Math.floor((currentGraceEndAt.getTime() - now) / 1000))
          setGraceSecondsLeft(graceLeft)
          setInGrace(timeLeft === 0 && graceLeft > 0)
        } else if (timeLeft === 0) {
          // If no graceEndAt but we're at 0 time left and status is finishedGrace,
          // use a default 5 minute grace period
          const defaultGraceEnd = new Date(currentEndAt.getTime() + 5 * 60 * 1000)
          const graceLeft = Math.max(0, Math.floor((defaultGraceEnd.getTime() - now) / 1000))
          setGraceSecondsLeft(graceLeft)
          setInGrace(graceLeft > 0)
        } else {
          setInGrace(false)
          setGraceSecondsLeft(0)
        }
      } else {
        setSecondsLeft(0)
        setInGrace(false)
        setGraceSecondsLeft(0)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [endAt, graceEndAt])

  return { secondsLeft, inGrace, graceSecondsLeft }
}
