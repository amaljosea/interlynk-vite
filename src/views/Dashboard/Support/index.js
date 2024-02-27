import { Flex } from '@chakra-ui/react'
import Card from 'components/Card/Card'
import SupportTable from 'components/Tables/SupportTable'
import React from 'react'

const Support = () => {
  return (
    <Flex
      flexDirection='column'
      pt={{ base: '120px', md: '74px' }}
      pr={2}
      pl={5}
    >
      <Card>
        <SupportTable data={null} />
      </Card>
    </Flex>
  )
}

export default Support
