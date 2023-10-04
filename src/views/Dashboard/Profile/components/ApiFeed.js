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
  Box
} from '@chakra-ui/react'
// Custom components
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import { useState } from 'react'
import { orgHealthChecks as orgHealthChecks } from 'variables/general'
import { sevColor } from 'utils'

const ApiFeed = () => {
  const textColor = useColorModeValue('gray.700', 'white')

  const [orgHealthCheck, setOrgHealthCheck] = useState(orgHealthChecks)

  const options = [
    { value: 'Critical', label: 'Critical', bg: 'red' },
    { value: 'High', label: 'High', bg: 'orange' },
    { value: 'Medium', label: 'Medium', bg: 'yellow' },
    { value: 'Low', label: 'Low', bg: 'green' },
    { value: 'None', label: 'None', bg: 'gray' }
  ]

  // Define a mapping of status values to background colors
  const statusColors = {
    Critical: 'red.300',
    High: 'orange.300',
    Medium: 'blue.300',
    Low: 'green.300',
    None: 'gray.300'
  }

  const handleStatusChange = (id, value) => {
    const updatedData = orgHealthCheck.map((item) =>
      item.id === id ? { ...item, status: value } : item
    )
    setOrgHealthCheck(updatedData)
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
            {orgHealthCheck.map((api, index) => (
              <Tr key={index}>
                <Td pl={0}>
                  <Switch defaultChecked></Switch>
                </Td>
                <Td pl={0}>
                  <Link
                    color={'blue.500'}
                    _hover={{ textDecoration: 'underline' }}
                    href={api.link}
                    target='_blank'
                  >
                    {api.title}
                  </Link>
                </Td>
                <Td pl={0}>
                  <Flex direction='column' rowGap={1} maxWidth={800}>
                    <Text fontSize={'sm'}>{api.description}</Text>
                    <Text fontSize={'10px'}>{api.long_desc}</Text>
                  </Flex>
                </Td>
                <Td pl={0}>
                  <Select
                    width={'130px'}
                    size='sm'
                    value={api.status}
                    onChange={(e) => handleStatusChange(api.id, e.target.value)}
                    bg={sevColor(api.status.toLowerCase()) + '.200'}
                    variant={'outline'}
                  >
                    {options.map((item, index) => (
                      <option key={index} value={item.value}>
                        {item.label}
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
