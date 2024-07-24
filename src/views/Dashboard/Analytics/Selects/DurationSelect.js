import { format, subDays } from 'date-fns'
import React, { useEffect } from 'react'

import { CustomSelect } from './Select'

const getStartAndEndDatesFromDayCount = (count) => {
  const today = new Date()
  const endDate = format(today, 'yyyy-MM-dd')
  const startDate = format(subDays(today, count), 'yyyy-MM-dd')

  return {
    startDate: startDate,
    endDate: endDate
  }
}

const days = [7, 14, 30, 90, 180, 365]

const options = days.map((day) => ({
  value: day,
  label: `Last ${day} Days`,
  ...getStartAndEndDatesFromDayCount(day)
}))

export const DurationSelect = ({ value, onChange }) => {
  useEffect(() => {
    const defaultValue = 14
    const defaultOption = options.find((i) => i.value === defaultValue)
    onChange(defaultOption)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <CustomSelect
      label='Duration'
      options={options}
      value={value}
      onChange={onChange}
    />
  )
}
