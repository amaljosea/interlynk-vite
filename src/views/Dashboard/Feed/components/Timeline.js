import React from 'react'
import { Flex, Tag } from '@chakra-ui/react'

function formatDate(date) {
  const options = { month: 'short', day: 'numeric' }
  return new Intl.DateTimeFormat('en-US', options).format(date)
}

const Timeline = () => {
  const today = new Date()

  const days = [...Array(30)].map((_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() + index)

    return (
      <Tag
        p={2}
        key={index}
        borderRadius={5}
        textAlign={'center'}
        variant={'outline'}
        colorScheme={'blue'}
      >
        {formatDate(date)}
      </Tag>
    )
  })

  return (
    <Flex
      gap={2}
      mb={10}
      align='center'
      position='relative'
      flexDirection={'row'}
      cursor={'pointer'}
      flexWrap={'wrap'}
    >
      {days}
    </Flex>
  )
}

export default Timeline
