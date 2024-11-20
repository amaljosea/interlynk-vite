import React, { useMemo } from 'react'

import {
  Box,
  Flex,
  Heading,
  IconButton,
  Table,
  TableContainer,
  Tag,
  TagLabel,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr
} from '@chakra-ui/react'

import { CustomText } from 'components/Misc/CustomText'

import { useThemeColor } from 'hooks/useThemeColors'

import { FaEye } from 'react-icons/fa'

const ExpandedComponent = ({ data, onCheckViolations }) => {
  const { policy } = data

  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  return useMemo(() => {
    return (
      <Flex
        p={5}
        gap={6}
        width={'100%'}
        flexDir={'column'}
        boxShadow='inset 0px -5px 5px rgba(0, 0, 0, 0.08), inset 0px 5px 5px rgba(0, 0, 0, 0.08)'
      >
        {/* Description */}
        <Box>
          <CustomText>Description :</CustomText>
          <Text
            color={primaryTextColor}
            width={'90%'}
            mt={1}
            fontSize={14}
            wordBreak={'break-all'}
          >
            {policy?.description || ''}
          </Text>
        </Box>

        {/* Results Table */}
        <Box>
          <Heading
            mb={2}
            fontFamily={'inherit'}
            fontSize={'sm'}
            color={primaryTextColor}
            textTransform={'uppercase'}
          >
            Results
          </Heading>
          <TableContainer>
            <Table variant='striped'>
              <Thead>
                <Tr>
                  {['subject', 'operator', 'value', 'violations', 'action'].map(
                    (item, index) => (
                      <Th
                        fontFamily={'inherit'}
                        key={index}
                        color={primaryTextColor}
                        isNumeric={item === 'action' || item === 'violations'}
                      >
                        {item}
                      </Th>
                    )
                  )}
                </Tr>
              </Thead>
              <Tbody>
                {policy?.policyRules?.length > 0 &&
                  policy?.policyRules?.map((item, index) => (
                    <Tr key={index}>
                      {/* Subject */}
                      <Td>
                        <Text
                          color={primaryTextColor}
                          fontSize={'sm'}
                          textTransform={'capitalize'}
                        >
                          {`${item?.category} ${item?.name}`}
                        </Text>
                      </Td>

                      {/* Operator */}
                      <Td>
                        <Text
                          color={primaryTextColor}
                          fontSize={'sm'}
                          textTransform={'lowercase'}
                        >
                          {item?.operatorWording}
                        </Text>
                      </Td>

                      {/* Value */}
                      <Td>
                        <Text
                          color={primaryTextColor}
                          fontSize={'sm'}
                          wordBreak={'break-all'}
                        >
                          {item?.value}
                        </Text>
                      </Td>

                      {/* Violations */}
                      <Td isNumeric>
                        <Tag width={'80px'} colorScheme='blue'>
                          <TagLabel mx={'auto'}>
                            {item?.policyRuleViolations?.totalCount || 0}
                          </TagLabel>
                        </Tag>
                      </Td>

                      {/* Action */}
                      <Td isNumeric>
                        <Tooltip label={'View Violations'}>
                          <IconButton
                            size='sm'
                            icon={<FaEye />}
                            colorScheme='blue'
                            fontWeight={'medium'}
                            onClick={() =>
                              onCheckViolations(policy?.name, item)
                            }
                          />
                        </Tooltip>
                      </Td>
                    </Tr>
                  ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      </Flex>
    )
  }, [onCheckViolations, policy, primaryTextColor])
}

export default ExpandedComponent
