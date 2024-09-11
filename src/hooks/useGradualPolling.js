import { useEffect, useState } from 'react'

export const useGradualPolling = ({
  initialPollTime = 1000,
  shouldPoll,
  startPolling,
  stopPolling
}) => {
  const [pollTime, setPollTime] = useState(initialPollTime)

  useEffect(() => {
    if (shouldPoll) {
      startPolling(pollTime)
      const timer = setTimeout(() => {
        if (pollTime >= 10000) {
          setPollTime(10000)
        } else {
          setPollTime((prevTime) => prevTime + 1000)
        }
      }, pollTime) // Wait for the current poll time before increasing

      return () => clearTimeout(timer)
    } else {
      stopPolling()
      setPollTime(initialPollTime)
    }
  }, [shouldPoll, startPolling, stopPolling, pollTime, initialPollTime])
}
