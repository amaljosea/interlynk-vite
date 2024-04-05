import React from 'react'
import { convertDateFormat, getDateFormat } from 'utils'

import { Flex, Tag } from '@chakra-ui/react'

import Card from 'components/Card/Card'

const Timeline = ({ formattedDate, setFormattedDate, getFeed }) => {
  const currentDate = new Date()
  const last30DaysList = []

  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(currentDate.getDate() - i)
    last30DaysList.push(date.toDateString())
  }

  const getCurrentDate = (date) => {
    setFormattedDate(getDateFormat(date))
    getFeed({
      variables: {
        date: getDateFormat(date),
        first: 10
      }
    })
  }

  const days = last30DaysList.map((date, index) => {
    return (
      <Tag
        p={2}
        key={index}
        borderRadius={5}
        textAlign={'center'}
        variant={formattedDate === getDateFormat(date) ? 'solid' : 'outline'}
        colorScheme={'blue'}
        onClick={() => getCurrentDate(date)}
      >
        {convertDateFormat(date)}
      </Tag>
    )
  })

  return (
    <Card>
      <Flex
        gap={2}
        align='center'
        position='relative'
        flexDirection={'row'}
        cursor={'pointer'}
        flexWrap={'wrap'}
      >
        {days}
      </Flex>
    </Card>
  )
}

export default Timeline
