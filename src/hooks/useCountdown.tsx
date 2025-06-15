"use client"

import { useState, useEffect } from "react"

interface CountdownResult {
  secondsLeft: number
  inGrace: boolean
  graceSecondsLeft: number
}

export default function useCountdown(endAt?: Date, graceEndAt?: Date): CountdownResult {
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [inGrace, setInGrace] = useState(false)
  const [graceSecondsLeft, setGraceSecondsLeft] = useState(0)

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()

      if (endAt) {
        const timeLeft = Math.max(0, Math.floor((endAt.getTime() - now.getTime()) / 1000))
        setSecondsLeft(timeLeft)

        // Check if we're in grace period
        if (graceEndAt) {
          const graceLeft = Math.max(0, Math.floor((graceEndAt.getTime() - now.getTime()) / 1000))
          setGraceSecondsLeft(graceLeft)
          setInGrace(timeLeft === 0 && graceLeft > 0)
        } else if (timeLeft === 0) {
          // If no graceEndAt but we're at 0 time left and status is finishedGrace,
          // use a default 5 minute grace period
          const defaultGraceEnd = new Date(endAt.getTime() + 5 * 60 * 1000)
          const graceLeft = Math.max(0, Math.floor((defaultGraceEnd.getTime() - now.getTime()) / 1000))
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
