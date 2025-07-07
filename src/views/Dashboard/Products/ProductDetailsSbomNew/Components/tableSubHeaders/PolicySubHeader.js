import { useMemo } from 'react'

import { Flex, IconButton, Tooltip } from '@chakra-ui/react'

import RefreshBtn from 'components/Icons/RefreshBtn'

import { LuTextSearch } from 'react-icons/lu'

const PolicySubHeader = (isArchived, handleRefresh, policyRun, isInDraft) => {
  const subHeader = useMemo(() => {
    return (
      <Flex
        gap={2}
        width={'100%'}
        alignItems={'center'}
        justifyContent={'flex-end'}
      >
        {!isInDraft && (
          <Tooltip label='Policy Scan'>
            <IconButton
              colorScheme='blue'
              hidden={isArchived}
              onClick={handleRefresh}
              isDisabled={!policyRun}
              icon={<LuTextSearch size={18} />}
            />
          </Tooltip>
        )}
        <RefreshBtn queries={['PolicyResults']} />
      </Flex>
    )
  }, [isInDraft, isArchived, handleRefresh, policyRun])

  return subHeader
}

export default PolicySubHeader
