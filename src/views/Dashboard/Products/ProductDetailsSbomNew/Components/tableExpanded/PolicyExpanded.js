import { useQuery } from '@apollo/client'
import { useMemo } from 'react'
import { getIcon } from 'utils/styleUtils'

import { Box, Flex, Stack, Text, Tooltip } from '@chakra-ui/react'
import { Icon, IconButton } from '@chakra-ui/react'
import { Input, InputGroup, InputLeftAddon } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import { CustomText } from 'components/Misc/CustomText'

import { useThemeColor } from 'hooks/useThemeColors'

import { GetPolicyRules } from 'graphQL/Queries'

import { LuEye } from 'react-icons/lu'

const ExpandedComponent = ({ data, onCheckViolations }) => {
  const { policy, sbom } = data || {}

  const { primaryBlueText, primaryTextColor, secondaryTextInverse } =
    useThemeColor([
      'primaryBlueText',
      'primaryTextColor',
      'secondaryTextInverse'
    ])

  const { data: ruleData, loading } = useQuery(GetPolicyRules, {
    skip: policy?.id ? false : true,
    variables: { id: policy?.id, sbomId: sbom?.id }
  })

  const { policyRules } = ruleData?.policy || {}

  return useMemo(() => {
    if (loading)
      return (
        <Box pb={6}>
          <CustomLoader />
        </Box>
      )

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
          {policyRules?.length > 0 ? (
            <Stack mt={3} spacing={3}>
              {policyRules?.map((item, index) => (
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
                            fontSize={18}
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
                      w={'fit-content'}
                      colorScheme='blue'
                      fontWeight={'medium'}
                      icon={<LuEye size={18} />}
                      onClick={() => onCheckViolations(data, item)}
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
    data,
    loading,
    onCheckViolations,
    policyRules,
    primaryBlueText,
    primaryTextColor,
    secondaryTextInverse
  ])
}

export default ExpandedComponent
