import { useMemo } from 'react'
import { getIcon } from 'utils/styleUtils'

import { Box, Flex, Stack, Text, Tooltip } from '@chakra-ui/react'
import { Icon, IconButton } from '@chakra-ui/react'
import { Input, InputGroup, InputLeftAddon } from '@chakra-ui/react'

import { CustomText } from 'components/Misc/CustomText'

import { useThemeColor } from 'hooks/useThemeColors'

import { FaEye } from 'react-icons/fa'

const ExpandedComponent = ({ data, onCheckViolations }) => {
  const { policy } = data

  const { primaryBlueText, primaryTextColor, secondaryTextInverse } =
    useThemeColor([
      'primaryBlueText',
      'primaryTextColor',
      'secondaryTextInverse'
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
          <CustomText>RESULTS :</CustomText>
          {policy?.policyRules?.length > 0 ? (
            <Stack mt={3} spacing={3}>
              {policy?.policyRules?.map((item, index) => (
                <Flex gap={3} w={'100%'} key={index} alignItems={'center'}>
                  <Text w={'32'} fontSize={'sm'} color={primaryTextColor}>
                    {index + 1}.
                  </Text>
                  <InputGroup
                    size='sm'
                    fontSize={'sm'}
                    color={primaryTextColor}
                  >
                    <InputLeftAddon>
                      <Tooltip
                        label={item?.category}
                        textTransform={'capitalize'}
                      >
                        <Flex>
                          <Icon
                            color={primaryBlueText}
                            as={getIcon(item?.subject)}
                          />
                        </Flex>
                      </Tooltip>
                    </InputLeftAddon>
                    <Input
                      readOnly
                      textTransform={'capitalize'}
                      defaultValue={item?.name}
                      _focus={{ boxShadow: 'none' }}
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
                      defaultValue={item?.operatorWording?.toLowerCase()}
                    />
                  </InputGroup>
                  <InputGroup
                    size='sm'
                    fontSize={'sm'}
                    color={primaryTextColor}
                  >
                    <InputLeftAddon>Value</InputLeftAddon>
                    <Input
                      readOnly
                      _focus={{ boxShadow: 'none' }}
                      defaultValue={item?.value || 'N/A'}
                    />
                  </InputGroup>
                  <InputGroup
                    size='sm'
                    fontSize={'sm'}
                    color={primaryTextColor}
                  >
                    <InputLeftAddon>Violation</InputLeftAddon>
                    <Input
                      readOnly
                      _focus={{ boxShadow: 'none' }}
                      defaultValue={item?.policyRuleViolations?.totalCount || 0}
                    />
                  </InputGroup>
                  <Tooltip label={'View Violations'}>
                    <IconButton
                      size='sm'
                      icon={<FaEye />}
                      w={'fit-content'}
                      colorScheme='blue'
                      fontWeight={'medium'}
                      onClick={() => onCheckViolations(policy?.name, item)}
                    />
                  </Tooltip>
                </Flex>
              ))}
            </Stack>
          ) : (
            <Text mt={3} color={secondaryTextInverse}>
              No record to display
            </Text>
          )}
        </Box>
      </Flex>
    )
  }, [
    onCheckViolations,
    policy?.name,
    policy?.policyRules,
    primaryBlueText,
    primaryTextColor,
    secondaryTextInverse
  ])
}

export default ExpandedComponent
