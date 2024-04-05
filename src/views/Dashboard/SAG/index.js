import { sagData } from 'variables/general'

import { Flex } from '@chakra-ui/react'

import SagTable from 'components/Tables/SagTable'

const Sag = () => {
  return (
    <Flex
      flexDirection='column'
      pt={{ base: '120px', md: '74px' }}
      gap={6}
      pr={2}
      pl={5}
    >
      <SagTable data={sagData} />
    </Flex>
  )
}

export default Sag
