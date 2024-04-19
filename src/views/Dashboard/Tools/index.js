import OrgRegister from 'views/Dashboard/Profile/components/OrgRegister'

import { Flex } from '@chakra-ui/react'

import Compare from './Compare'

const Tools = () => {
  const org = localStorage.getItem('organization')
  return (
    <Flex
      flexDirection='column'
      pt={{ base: '120px', md: '74px' }}
      gap={6}
      pr={2}
      pl={5}
    >
      {!org || org === 'undefined' ? (
        <OrgRegister />
      ) : (
        <Compare selectedSboms={null} />
      )}
    </Flex>
  )
}

export default Tools
