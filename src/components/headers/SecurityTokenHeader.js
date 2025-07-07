import React, { useMemo } from 'react'

import { Flex, IconButton, Text, Tooltip } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { LuCirclePlus } from 'react-icons/lu'

const SecurityTokenHeader = ({ action, tokenRef }) => {
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  return useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Flex flexDirection={'column'}>
          <Text
            fontSize='lg'
            color={primaryTextColor}
            fontWeight='bold'
            textAlign={'start'}
          >
            Security Tokens
          </Text>
          <Text fontSize={'sm'}>
            Secure your organization with essential tokens for data protection
          </Text>
        </Flex>

        {/* NER TOKEN */}
        <Tooltip label='New Token'>
          <IconButton
            ref={tokenRef}
            onClick={() => action('update_token', null)}
            data-testid='new_token'
            icon={<LuCirclePlus size={18} />}
            colorScheme='blue'
            variant='solid'
            fontWeight='normal'
            fontSize={'sm'}
          />
        </Tooltip>
      </Flex>
    )
  }, [action, primaryTextColor, tokenRef])
}

export default SecurityTokenHeader
