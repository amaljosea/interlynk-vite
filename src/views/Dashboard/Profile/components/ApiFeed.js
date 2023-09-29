// Chakra imports
import {
  Text,
  Table,
  Tbody,
  Td,
  Tr,
  Button,
  useColorModeValue,
  Select,
  Link
} from '@chakra-ui/react'
// Custom components
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import { useState } from 'react'
import { apiGetwayData } from 'variables/general'

const ApiFeed = () => {
  const textColor = useColorModeValue('gray.700', 'white')

  const [apiList, setApiList] = useState(apiGetwayData)

  const options = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
    { value: 'none', label: 'None' }
  ]

  const handleStatusChange = (id, value) => {
    const updatedData = apiList.map((item) =>
      item.id === id ? { ...item, status: value } : item
    )
    setApiList(updatedData)
  }

  return (
    <Card p={0}>
      <CardHeader p='12px 0' mb='8px'>
        <Text fontSize='lg' color={textColor} fontWeight='bold'>
          API Gateway (REST APIs)
        </Text>
      </CardHeader>
      <CardBody>
        <Table variant='simple' size='sm'>
          <Tbody>
            {apiList.map((api, index) => (
              <Tr key={index}>
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
                <Td pl={0}>{api.description}</Td>
                <Td pl={0}>
                  <Select
                    width={'130px'}
                    value={api.status}
                    onChange={(e) => handleStatusChange(api.id, e.target.value)}
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
