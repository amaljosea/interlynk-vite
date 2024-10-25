import { useMemo } from 'react'

import { Flex, IconButton, Tooltip } from '@chakra-ui/react'

import { BiScan } from 'react-icons/bi'

const PolicySubHeader = (isArchived, handleRefresh, policyRun) => {
  const subHeader = useMemo(() => {
    return (
      <Flex width={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
        <Tooltip label='Policy Scan'>
          <IconButton
            colorScheme='blue'
            hidden={isArchived}
            onClick={handleRefresh}
            isDisabled={!policyRun}
            icon={<BiScan size={20} />}
          />
        </Tooltip>
      </Flex>
    )
  }, [isArchived, handleRefresh, policyRun])

  return subHeader
}

export default PolicySubHeader
