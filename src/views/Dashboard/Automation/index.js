import { AddIcon, DeleteIcon } from '@chakra-ui/icons'
import {
  Flex,
  Text,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Button,
  Input,
  Switch,
  Select
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import React, { useState } from 'react'

const Automation = () => {
  const captions = [
    'Active',
    'Selector',
    'Condition',
    'Selector',
    'Condition Two',
    'Fix Action'
  ]

  const [data, setData] = useState([
    {
      id: 1,
      active: true,
      selectorOne: '',
      conditionOne: '',
      selectorTwo: '',
      conditionTwo: '',
      fixAction: ''
    }
  ])

  const addRow = () => {
    const newRow = {
      id: Date.now(),
      active: true,
      selectorOne: '',
      conditionOne: '',
      selectorTwo: '',
      conditionTwo: '',
      fixAction: ''
    }
    setData([...data, newRow])
  }

  const deleteRow = (id) => {
    const updatedData = data.filter((item) => item.id !== id)
    setData(updatedData)
  }

  const handleInputChange = (id, column, value) => {
    const updatedData = data.map((item) => {
      if (item.id === id && column === 'selectorOne') {
        return { ...item, [column]: value, selectorTwo: '' }
      }
      if (item.id === id) {
        return { ...item, [column]: value }
      }
      return item
    })
    setData(updatedData)
  }

  return (
    <Flex direction='column' pt={{ base: '120px', md: '74px' }} px={4}>
      <Card>
        <CardHeader px={5}>
          <Flex
            alignItems={'center'}
            justifyContent={'space-between'}
            width={'100%'}
          >
            <Text fontSize={18}>Automation Rules</Text>
            <Button
              size='sm'
              variant='solid'
              colorScheme='blue'
              mt={4}
              leftIcon={<AddIcon />}
              onClick={addRow}
            >
              Add Row
            </Button>
          </Flex>
        </CardHeader>
        <CardBody mt={6}>
          <Table variant='simple' p={0}>
            <Thead>
              <Tr>
                {captions.map((item, index) => (
                  <Th pb={3} key={index}>
                    <Box>{item}</Box>
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {data.map((row) => (
                <Tr key={row.id}>
                  <Td>
                    <Switch
                      isChecked={row.active}
                      onChange={(e) =>
                        handleInputChange(row.id, 'active', e.target.checked)
                      }
                    ></Switch>
                  </Td>
                  <Td>
                    <Select
                      size='sm'
                      value={row.selectorOne}
                      onChange={(e) =>
                        handleInputChange(row.id, 'selectorOne', e.target.value)
                      }
                    >
                      <option value=''>-- Select --</option>
                      <option value='document'>Document</option>
                      <option value='component'>Component</option>
                    </Select>
                  </Td>
                  <Td>
                    <Input
                      size='sm'
                      value={row.conditionOne}
                      onChange={(e) =>
                        handleInputChange(
                          row.id,
                          'conditionOne',
                          e.target.value
                        )
                      }
                    />
                  </Td>
                  <Td>
                    {row.selectorOne === 'document' ? (
                      <Select
                        size='sm'
                        value={row.selectorTwo}
                        onChange={(e) =>
                          handleInputChange(
                            row.id,
                            'selectorTwo',
                            e.target.value
                          )
                        }
                      >
                        <option value=''>-- Select --</option>
                        <option value='PURL'>PURL</option>
                        <option value='CPE'>CPE</option>
                        <option value='Type'>Type</option>
                        <option value='Version'>Version</option>
                        <option value='Creation Time'>Creation Time</option>
                        <option value='Creation Tools'>Creation Tools</option>
                        <option value='Author'>Author</option>
                        <option value='Primary Component'>
                          Primary Component
                        </option>
                      </Select>
                    ) : (
                      <Select
                        size='sm'
                        value={row.selectorTwo}
                        onChange={(e) =>
                          handleInputChange(
                            row.id,
                            'selectorTwo',
                            e.target.value
                          )
                        }
                      >
                        <option value=''>-- Select --</option>
                        <option value='PURL'>PURL</option>
                        <option value='CPE'>CPE</option>
                        <option value='Type'>Type</option>
                        <option value='Version'>Version</option>
                        <option value='Name'>Name</option>
                      </Select>
                    )}
                  </Td>
                  <Td>
                    <Select
                      size='sm'
                      value={row.conditionTwo}
                      onChange={(e) =>
                        handleInputChange(
                          row.id,
                          'conditionTwo',
                          e.target.value
                        )
                      }
                    >
                      <option value=''>-- Select --</option>
                      <option value='missing'>Missing</option>
                      <option value='invalid'>Invalid</option>
                    </Select>
                  </Td>
                  <Td>
                    {row.selectorTwo !== '' ? (
                      <Flex alignItems={'center'} gap={2}>
                        <Text fontSize={'sm'}>Set {row.selectorTwo}</Text>
                        {row.selectorOne === 'component' ? (
                          <Button size='sm'>Launch</Button>
                        ) : (
                          <Button size='sm'>Fix</Button>
                        )}
                      </Flex>
                    ) : (
                      ''
                    )}
                  </Td>
                  <Td>
                    <IconButton
                      size='sm'
                      icon={<DeleteIcon />}
                      onClick={() => deleteRow(row.id)}
                      colorScheme='red'
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </Flex>
  )
}

export default Automation
