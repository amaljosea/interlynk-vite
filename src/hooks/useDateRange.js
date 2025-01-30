import { useEffect, useState } from 'react'

const useDateRange = () => {
  const [dates, setDates] = useState({ startDate: '', endDate: '' })

  useEffect(() => {
    const today = new Date()
    today.setDate(today.getDate() - 1)

    const endDate = today.toISOString().split('T')[0]

    const startDateObj = new Date(today)
    startDateObj.setDate(startDateObj.getDate() - 6)

    const startDate = startDateObj.toISOString().split('T')[0]

    setDates({ startDate, endDate })
  }, [])

  return dates
}

export default useDateRange
