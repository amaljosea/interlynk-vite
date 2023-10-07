// Chakra imports
import {
  Text,
  Table,
  Tbody,
  Td,
  Tr,
  Th,
  Thead,
  Flex,
  Switch,
  useColorModeValue,
  Select,
  Link,
  Box,
  useToast
} from '@chakra-ui/react'
// Custom components
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import { useState } from 'react'
import { orgHealthChecks as orgHealthChecks } from 'variables/general'
import { sevColor } from 'utils'
import { useMutation } from '@apollo/client'
import { orgRuleUpdate } from 'graphQL/Mutation'

const ApiFeed = ({ data }) => {
  const textColor = useColorModeValue('gray.700', 'white')

  const toast = useToast()

  const [updateRule] = useMutation(orgRuleUpdate)

  const options = [
    { value: 'critical', label: 'Critical', bg: 'red' },
    { value: 'high', label: 'High', bg: 'orange' },
    { value: 'medium', label: 'Medium', bg: 'yellow' },
    { value: 'low', label: 'Low', bg: 'green' }
  ]

  const handleChange = async (value, id) => {
    try {
      await updateRule({
        variables: {
          id: id,
          enabled: value === true ? true : false
        }
      }).then(() => window.location.reload())
    } catch (error) {
      console.error('Mutation error:', error)
    }
  }

  const handleStatusChange = async (id, value) => {
    try {
      await updateRule({
        variables: {
          id: id,
          severity: value
        }
      }).then(() => window.location.reload())
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Card p={0}>
      <CardHeader p='12px 0' mb='8px'>
        <Text fontSize='lg' color={textColor} fontWeight='bold'>
          SBOM Checks
        </Text>
      </CardHeader>
      <CardBody>
        <Table variant='simple' size='sm'>
          <Thead mb={2}>
            <Tr my='.8rem'>
              <Th pl={0}>
                <Box>Active</Box>
              </Th>
              <Th pl={0}>
                <Box>Check ID</Box>
              </Th>
              <Th pl={0}>
                <Box>Description</Box>
              </Th>
              <Th pl={0}>
                <Box>Severity</Box>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((item, index) => (
              <Tr key={index}>
                <Td pl={0}>
                  <Switch
                    isChecked={item.enabled}
                    onChange={(e) => handleChange(e.target.checked, item.id)}
                  ></Switch>
                </Td>
                <Td pl={0}>{item.rule.friendlyId}</Td>
                <Td pl={0}>
                  <Flex direction='column' rowGap={1} maxWidth={800}>
                    <Text fontSize={'sm'}>{item.rule.shortDesc}</Text>
                    <Text fontSize={'10px'}>{item.rule.longDesc}</Text>
                  </Flex>
                </Td>
                <Td pl={0}>
                  <Select
                    width={'130px'}
                    size='sm'
                    value={item.severity}
                    onChange={(e) =>
                      handleStatusChange(item.id, e.target.value)
                    }
                    bg={sevColor(item.severity.toLowerCase()) + '.200'}
                    variant={'outline'}
                  >
                    {options.map((itm, index) => (
                      <option key={index} value={itm.value}>
                        {itm.label}
                      </option>
                    ))}
                  </Select>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  )
}

export default ApiFeed
