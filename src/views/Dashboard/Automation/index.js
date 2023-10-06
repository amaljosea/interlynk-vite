import { AddIcon, DeleteIcon, SearchIcon } from '@chakra-ui/icons'
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
  Select,
  Tag,
  Tooltip
} from '@chakra-ui/react'
import { SettingsIcon } from 'components/Icons/Icons'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import GlobalContext from 'context/GlobalContext'
import React, { useState } from 'react'
import { useContext } from 'react'

const Automation = () => {
  const captions = [
    'Active',
    'Rule Applies To',
    'Name',
    'Condition',
    'Attribute',
    'Fix'
  ]

  const { automationRules, setAutomationRules } = useContext(GlobalContext)

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
    setAutomationRules([...automationRules, newRow])
  }

  const deleteRow = (id) => {
    const updatedData = automationRules.filter((item) => item.id !== id)
    setAutomationRules(updatedData)
  }

  const handleInputChange = (id, column, value) => {
    const updatedData = automationRules.map((item) => {
      if (item.id === id && column === 'selectorOne') {
        return { ...item, [column]: value, selectorTwo: '' }
      }
      if (item.id === id) {
        return { ...item, [column]: value }
      }
      return item
    })
    setAutomationRules(updatedData)
  }

  return (
    <Flex direction='column' pt={{ base: '120px', md: '74px' }} px={4}>
      <Card zIndex={'-1'} bg='white'>
        <CardHeader px={5}>
          <Flex
            alignItems={'center'}
            justifyContent={'space-between'}
            width={'100%'}
          >
            <Text fontSize={18}>Rule Automation Settings</Text>
            <Tooltip label='Add Rule'>
              <IconButton
                variant='solid'
                colorScheme='blue'
                fontWeight='normal'
                icon={<AddIcon />}
              />
            </Tooltip>
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
              {automationRules.map((row) => (
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
                      disabled={row.selectorOne === 'document'}
                      placeholder='Add name'
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
                      <option value='Missing'>Missing</option>
                      <option value='Invalid'>Invalid</option>
                      <option value='Invalid'>Missing or Invalid</option>
                      <option value='Always'>Always</option>
                    </Select>
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
                        <option value='Supplier'>Supplier</option>
                        <option value='Author'>Author</option>
                        <option value='Creation Time'>Creation Time</option>
                        <option value='Creation Tools'>Creation Tools</option>
                        <option value='Product Type'>Product Type</option>
                        <option value='Product Version'>Product Version</option>
                        <option value='Package URL (PURL)'>
                          Package URL (PURL)
                        </option>
                        <option value='Common Platform Enumeration (CPE)'>
                          Common Platform Enumeration (CPE)
                        </option>
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
                        <option value='Component Version'>
                          Component Version
                        </option>
                        <option value='Component Type'>Component Type</option>
                        <option value='Package URL (PURL)'>
                          Package URL (PURL)
                        </option>
                        <option value='Common Platform Enumeration (CPE)'>
                          Common Platform Enumeration (CPE)
                        </option>
                      </Select>
                    )}
                  </Td>
                  <Td>
                    {row.selectorTwo !== '' ? (
                      <Flex alignItems={'center'} gap={2}>
                        <Text fontSize={'sm'}>Set:</Text>
                        {row.selectorOne === 'component' ? (
                          <Tag minW='250px'>pkg:nuget/Fizzler@1.2.0</Tag>
                        ) : (
                          <Tag minW='250px'>Biotronik.ScsApp.Pr-1.0.0</Tag>
                        )}
                        <IconButton
                          size='sm'
                          colorScheme='blue'
                          icon={<SettingsIcon />}
                        />
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
