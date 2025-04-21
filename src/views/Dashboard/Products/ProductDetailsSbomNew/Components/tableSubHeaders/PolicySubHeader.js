import { useMemo } from 'react'

import { Flex, IconButton, Tooltip } from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'

import { BiScan } from 'react-icons/bi'

const PolicySubHeader = (reset, isArchived, handleRefresh, policyRun) => {
  const subHeader = useMemo(() => {
    return (
      <Flex
        gap={2}
        width={'100%'}
        alignItems={'center'}
        justifyContent={'flex-end'}
      >
        <Tooltip label='Policy Scan'>
          <IconButton
            colorScheme='blue'
            hidden={isArchived}
            onClick={handleRefresh}
            isDisabled={!policyRun}
            icon={<BiScan size={20} />}
          />
        </Tooltip>
        <RefreshBtn onClick={reset} />
      </Flex>
    )
  }, [isArchived, handleRefresh, policyRun, reset])

  return subHeader
}

export default PolicySubHeader
