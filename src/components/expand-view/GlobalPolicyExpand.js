import { useMemo } from 'react'
import { formatConditionValue, updatedValue } from 'utils'
import { getIcon } from 'utils/styleUtils'

import { Box, Flex, Icon, Stack, Text, Tooltip } from '@chakra-ui/react'
import { Input, InputGroup, InputLeftAddon } from '@chakra-ui/react'

import { CustomText } from 'components/Misc/CustomText'

import { useThemeColor } from 'hooks/useThemeColors'

const GlobalPolicyExpand = ({ data, formatSubject }) => {
  const { policyRules } = data || {}

  const { primaryBlueText, primaryTextColor } = useThemeColor([
    'primaryBlueText',
    'primaryTextColor'
  ])

  return useMemo(() => {
    return (
      <Flex
        p={5}
        gap={6}
        width={'100%'}
        flexDir={'column'}
        boxShadow='inset 0px -5px 5px rgba(0, 0, 0, 0.08), inset 0px 5px 5px rgba(0, 0, 0, 0.08)'
      >
        <Box>
          <CustomText>CONDITIONS :</CustomText>
          <Stack mt={3} spacing={3}>
            {policyRules?.map((item, index) => {
              const { name, category } = formatSubject(item?.subject)
              return (
                <Flex gap={3} key={index} alignItems={'center'}>
                  <Text w={'12'} fontSize={'sm'} color={primaryTextColor}>
                    {index + 1}.
                  </Text>
                  <InputGroup
                    size='sm'
                    fontSize={'sm'}
                    color={primaryTextColor}
                  >
                    <InputLeftAddon>
                      <Tooltip label={category} textTransform={'capitalize'}>
                        <Flex>
                          <Icon
                            color={primaryBlueText}
                            as={getIcon(item.subject)}
                          />
                        </Flex>
                      </Tooltip>
                    </InputLeftAddon>
                    <Input
                      readOnly
                      textTransform={'capitalize'}
                      _focus={{ boxShadow: 'none' }}
                      defaultValue={name}
                    />
                  </InputGroup>
                  <InputGroup
                    size='sm'
                    fontSize={'sm'}
                    color={primaryTextColor}
                  >
                    <InputLeftAddon>Operator</InputLeftAddon>
                    <Input
                      readOnly
                      _focus={{ boxShadow: 'none' }}
                      defaultValue={updatedValue(item?.operator?.toLowerCase())}
                    />
                  </InputGroup>
                  {item?.value && (
                    <InputGroup
                      size='sm'
                      fontSize={'sm'}
                      color={primaryTextColor}
                    >
                      <InputLeftAddon>Value</InputLeftAddon>
                      <Input
                        readOnly
                        textTransform={'capitalize'}
                        _focus={{ boxShadow: 'none' }}
                        defaultValue={formatConditionValue(item)}
                      />
                    </InputGroup>
                  )}
                </Flex>
              )
            })}
          </Stack>
        </Box>
      </Flex>
    )
  }, [formatSubject, policyRules, primaryBlueText, primaryTextColor])
}

export default GlobalPolicyExpand
