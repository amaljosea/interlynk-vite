import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { updatedValue } from 'utils'

import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Text,
  Textarea
} from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'

import { PolicyCreate, PolicyUpdate } from 'graphQL/Mutation'
import { PolicySubjectOperators } from 'graphQL/Queries'

import { FaTrash } from 'react-icons/fa'
import { FaPlus } from 'react-icons/fa6'

const PolicyModal = ({ data, isOpen, onClose, refetch }) => {
  const { totalRows, policyState } = useGlobalState()
  const { searchInput } = policyState
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [operator, setOperator] = useState('')
  const [resultType, setResultType] = useState('')
  const [error, setError] = useState('')
  const [conditions, setConditions] = useState([
    {
      id: 1,
      subject: '',
      operator: '',
      value: '',
      list: [],
      status: 'CREATED',
      min: '0',
      max: '0',
      subError: '',
      opError: '',
      valError: ''
    }
  ])
  const [deletedRules, setDeletedRules] = useState([])

  const { data: subOperators } = useQuery(PolicySubjectOperators, {
    fetchPolicy: 'network-only'
  })
  const [createPolicy] = useMutation(PolicyCreate)
  const [updatePolicy] = useMutation(PolicyUpdate)

  const sortedData =
    subOperators &&
    [...subOperators.policySubjectOperatorMapping].sort((a, b) =>
      a?.subject?.localeCompare(b?.subject)
    )

  const categories = [...new Set(sortedData?.map((item) => item.category))]

  const optionsByCategory = categories.reduce((acc, category) => {
    const options = subOperators?.policySubjectOperatorMapping
      .filter((item) => item.category === category)
      .map((item) => (
        <option
          value={item.subject}
          key={item?.subject}
          style={{ textTransform: 'capitalize' }}
        >
          {item.category} {item.name}
        </option>
      ))
    acc[category] = options
    return acc
  }, {})

  const handleRefetch = () => {
    refetch({
      variables: {
        search: searchInput === '' ? undefined : searchInput,
        first: totalRows
      }
    })
  }

  const onNameChange = (e) => {
    setName(e.target.value)
    setError('')
  }

  const onDescChange = (e) => {
    setDesc(e.target.value)
    setError('')
  }

  const onOperatorChange = (e) => {
    setOperator(e.target.value)
    setError('')
  }

  const onResultChange = (e) => {
    setResultType(e.target.value)
    setError('')
  }

  const hasSimilarRow = (data) => {
    for (let i = 0; i < data.length; i++) {
      for (let j = i + 1; j < data.length; j++) {
        if (
          data[i].subject === data[j].subject &&
          data[i].operator === data[j].operator &&
          data[i].value === data[j].value
        ) {
          return true // Similar row found
        }
      }
    }
    return false // No similar rows found
  }

  const addRow = () => {
    if (hasSimilarRow(conditions)) {
      setError(
        `A row with the empty or same values already exists. Please update or remove it before continue.`
      )
    } else {
      setError('')
      const newId = conditions?.length + 1
      setConditions([
        ...conditions,
        {
          id: newId,
          subject: '',
          operator: '',
          value: '',
          list: [],
          status: 'CREATED',
          min: '0',
          max: '0',
          subError: '',
          opError: '',
          valError: ''
        }
      ])
    }
  }

  const deleteRow = (rule) => {
    setError('')
    const newData = conditions?.filter((item) => item.id !== rule?.id)
    setConditions(newData)
    if (rule?.status === 'ADDED') {
      setDeletedRules((prev) => [...prev, rule])
    }
  }

  const handleChange = (value, id, field) => {
    setError('')
    const newData = conditions.map((item) => {
      if (item.id === id) {
        if (field === 'subject' && value !== '') {
          const result = subOperators?.policySubjectOperatorMapping?.find(
            (item) => item?.subject === value
          )
          return { ...item, [field]: value, list: result?.operators }
        } else if (
          field === 'operator' &&
          (value === 'EXISTS' || value === 'NOT_EXISTS')
        ) {
          return { ...item, [field]: value, value: 'Defined' }
        } else if (
          field === 'operator' &&
          (value === 'MORE_THAN' || value === 'LESS_THAN')
        ) {
          return { ...item, [field]: value, value: '' }
        } else {
          return { ...item, [field]: value }
        }
      }
      return item
    })
    setConditions(newData)
  }

  const onSubjectBlur = (rule) => {
    const newData = conditions.map((item) => {
      if (item.id === rule?.id) {
        if (rule?.subject === '') {
          return { ...item, subError: 'Please select any subject' }
        } else {
          return { ...item, subError: '' }
        }
      }
      return item
    })
    setConditions(newData)
  }

  const onOperatorBlur = (rule) => {
    const newData = conditions.map((item) => {
      if (item.id === rule?.id) {
        if (rule?.operator === '') {
          return { ...item, opError: 'Please select any operator' }
        } else {
          return { ...item, opError: '' }
        }
      }
      return item
    })
    setConditions(newData)
  }

  const handleBlur = (rule) => {
    const newData = conditions.map((item) => {
      if (item.id === rule?.id) {
        if (
          rule?.min !== '' &&
          rule?.max !== '' &&
          Number(rule?.max) < Number(rule?.min)
        ) {
          return { ...item, value: '', valError: 'Invalid EPSS range' }
        } else {
          return {
            ...item,
            value: `{"min":${rule?.min},max:${rule?.max}}`,
            valError: ''
          }
        }
      }
      return item
    })
    setConditions(newData)
  }

  const handleCreate = (e) => {
    e.preventDefault()
    const rules = []
    if (conditions?.length > 0) {
      conditions?.map((item) =>
        rules?.push({
          operator: item?.operator,
          subject: item?.subject,
          value:
            item?.operator === 'EXISTS' || item?.operator === 'NOT_EXISTS'
              ? undefined
              : item?.operator === 'RANGE'
                ? JSON.stringify(
                    { min: Number(item?.min), max: Number(item?.max) },
                    null,
                    2
                  )
                : item?.value
        })
      )
    }
    createPolicy({
      variables: {
        name,
        desc,
        isEnabled: true,
        operator: operator === '' ? undefined : operator,
        resultType: resultType === '' ? undefined : resultType,
        policyRulesAttributes: rules?.length > 0 ? rules : undefined
      }
    }).then((res) => {
      const errors = res?.data?.policyCreate?.errors
      if (errors?.length > 0) {
        setError(errors[0])
      } else {
        handleRefetch()
        setError('')
        setName('')
        setOperator('')
        setResultType('')
        onClose()
      }
    })
  }

  let prevRules = []
  const existingData = conditions?.filter((item) => item?.status === 'ADDED')
  existingData?.map((item) =>
    prevRules?.push({
      id: item?.id,
      operator: item?.operator,
      subject: item?.subject,
      value:
        item?.operator === 'EXISTS' || item?.operator === 'NOT_EXISTS'
          ? undefined
          : item?.operator === 'RANGE'
            ? JSON.stringify(
                { min: Number(item?.min), max: Number(item?.max) },
                null,
                2
              )
            : item?.value
    })
  )
  let newRules = []
  const newData = conditions?.filter((item) => item?.status === 'CREATED')
  newData?.map((item) =>
    newRules?.push({
      operator: item?.operator,
      subject: item?.subject,
      value:
        item?.operator === 'EXISTS' || item?.operator === 'NOT_EXISTS'
          ? undefined
          : item?.operator === 'RANGE'
            ? JSON.stringify(
                { min: Number(item?.min), max: Number(item?.max) },
                null,
                2
              )
            : item?.value
    })
  )
  let deleteRules = []
  deletedRules?.map((item) =>
    deleteRules?.push({ id: item?.id, _destroy: true })
  )

  const clearState = () => {
    setName('')
    setOperator('')
    setResultType('')
  }

  const handleUpdate = (e) => {
    e.preventDefault()
    if (prevRules?.length > 0) {
      updatePolicy({
        variables: {
          id: data?.id,
          name,
          desc,
          isEnabled: data?.isEnabled,
          operator: operator === '' ? undefined : operator,
          resultType: resultType === '' ? undefined : resultType,
          policyRulesAttributes: prevRules
        }
      }).then((res) => {
        const errors = res?.data?.policyUpdate?.errors
        if (errors?.length > 0) {
          setError(errors[0])
        } else {
          handleRefetch()
          clearState()
          onClose()
        }
      })
    }
    if (newRules?.length > 0) {
      updatePolicy({
        variables: {
          id: data?.id,
          name,
          desc,
          isEnabled: data?.isEnabled,
          operator: operator === '' ? undefined : operator,
          resultType: resultType === '' ? undefined : resultType,
          policyRulesAttributes: newRules
        }
      }).then((res) => {
        const errors = res?.data?.policyUpdate?.errors
        if (errors?.length > 0) {
          setError(errors[0])
        } else {
          handleRefetch()
          clearState()
          onClose()
        }
      })
    }
    if (deleteRules?.length > 0) {
      updatePolicy({
        variables: {
          id: data?.id,
          name,
          desc,
          isEnabled: data?.isEnabled,
          operator: operator === '' ? undefined : operator,
          resultType: resultType === '' ? undefined : resultType,
          policyRulesAttributes: deleteRules
        }
      }).then((res) => {
        const errors = res?.data?.policyUpdate?.errors
        if (errors?.length > 0) {
          setError(errors[0])
        } else {
          handleRefetch()
          clearState()
          onClose()
        }
      })
    }
  }

  const checkDataValidity = (data) => {
    for (let i = 0; i < data.length; i++) {
      const {
        subject,
        operator,
        value,
        min,
        max,
        subError,
        opError,
        valError
      } = data[i]
      if (
        subject === '' ||
        operator === '' ||
        value === '' ||
        min === '' ||
        max === '' ||
        subError !== '' ||
        opError !== '' ||
        valError !== ''
      ) {
        return 'Error: Some properties are empty'
      }
    }
    return null
  }

  const errorMessage = checkDataValidity(conditions)

  const blockInvalidChar = (e) =>
    ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()

  useEffect(() => {
    if (data && subOperators) {
      setName(data?.name || '')
      setDesc(data?.description || '')
      setOperator(
        data?.operator === 'any' ? 'ANY' : data?.operator === 'all' ? 'ALL' : ''
      )
      setResultType(
        data?.resultType === 'warn'
          ? 'WARN'
          : data?.resultType === 'inform'
            ? 'INFORM'
            : 'FAIL'
      )
      const rules = []
      const opList = (item) =>
        subOperators?.policySubjectOperatorMapping?.find(
          (op) => op?.subject === item?.subject
        )
      data?.policyRules?.map((item) =>
        rules?.push({
          id: item?.id,
          subject: item?.subject,
          operator: item?.operator,
          value:
            item?.operator === 'EXISTS' || item?.operator === 'NOT_EXISTS'
              ? 'Defined'
              : item?.value,
          list: opList(item)?.operators,
          status: 'ADDED',
          min: item?.operator === 'RANGE' ? JSON.parse(item?.value)?.min : '0',
          max: item?.operator === 'RANGE' ? JSON.parse(item?.value)?.max : '0',
          subError: '',
          opError: '',
          valError: ''
        })
      )
      setConditions(rules)
    }
  }, [data, subOperators])

  return (
    <>
      <Modal
        size='5xl'
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <form onSubmit={data ? handleUpdate : handleCreate}>
          <ModalContent>
            <ModalHeader>{data ? 'Edit' : 'Create'} Policy</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex width={'100%'} direction={'column'} gap={4}>
                <Flex alignItems={'center'} gap={3}>
                  <Text>Policy:</Text>
                  <FormControl isRequired>
                    <Input
                      size='sm'
                      type='text'
                      name='name'
                      placeholder='Enter name'
                      value={name}
                      onChange={onNameChange}
                    />
                  </FormControl>
                </Flex>
                <Flex alignItems={'flex-start'} gap={3}>
                  <Text>Description:</Text>
                  <FormControl>
                    <Textarea
                      size='sm'
                      type='text'
                      name='desc'
                      placeholder='Enter description'
                      value={desc}
                      onChange={onDescChange}
                    />
                  </FormControl>
                </Flex>
                <Flex
                  flexDir={'column'}
                  alignItems={'flex-start'}
                  gap={3}
                  flexWrap={'wrap'}
                >
                  <Flex alignItems={'center'} gap={3}>
                    <Text>will</Text>
                    <FormControl width={200} isRequired>
                      <Select
                        size='sm'
                        id='resultType'
                        name='resultType'
                        value={resultType}
                        onChange={onResultChange}
                        textTransform={'capitalize'}
                        fontSize='sm'
                      >
                        <option value=''>-- Select --</option>
                        {['INFORM', 'WARN', 'FAIL'].map((item, index) => (
                          <option
                            key={index}
                            value={item}
                            style={{ textTransform: 'capitalize' }}
                          >
                            {item}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </Flex>
                  <Flex alignItems={'center'} gap={3}>
                    <Text>when</Text>
                    <FormControl width={200} isRequired>
                      <Select
                        size='sm'
                        id='operator'
                        name='operator'
                        value={operator}
                        onChange={onOperatorChange}
                        textTransform={'capitalize'}
                        fontSize='sm'
                      >
                        <option value=''>-- Select --</option>
                        {['ANY', 'ALL'].map((item, index) => (
                          <option
                            key={index}
                            value={item}
                            style={{ textTransform: 'capitalize' }}
                          >
                            {item}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </Flex>
                  <Text>conditions are met:</Text>
                </Flex>
                <Flex
                  width={'100%'}
                  my={2}
                  justifyContent={'space-between'}
                  alignItems={'center'}
                >
                  <Heading
                    fontWeight={'medium'}
                    fontFamily={'inherit'}
                    fontSize={'md'}
                  >
                    Conditions
                  </Heading>
                  <IconButton
                    size='sm'
                    colorScheme='blue'
                    icon={<FaPlus />}
                    onClick={addRow}
                  />
                </Flex>
                {conditions?.length > 0 &&
                  conditions?.map((item, index) => (
                    <Grid
                      key={index}
                      gap={4}
                      templateColumns='repeat(12, 1fr)'
                      alignItems={'flex-start'}
                    >
                      <GridItem colSpan={3}>
                        <FormControl>
                          <Select
                            size='sm'
                            value={item?.subject}
                            onChange={(e) =>
                              handleChange(e.target.value, item.id, 'subject')
                            }
                            onBlur={() => onSubjectBlur(item)}
                            placeholder='-- Select Subject --'
                            fontSize='sm'
                            onBlurCapture={() => onSubjectBlur(item)}
                            textTransform={'capitalize'}
                          >
                            {categories.map((category) => (
                              <optgroup key={category} label={category}>
                                {optionsByCategory[category]}
                              </optgroup>
                            ))}
                          </Select>
                          {item?.subError !== '' && (
                            <Text mt={1} color={'red.500'} fontSize={'sm'}>
                              {item?.subError}
                            </Text>
                          )}
                        </FormControl>
                      </GridItem>
                      <GridItem colSpan={3}>
                        <FormControl>
                          <Select
                            size='sm'
                            id='operator'
                            name='operator'
                            value={item?.operator}
                            onChange={(e) =>
                              handleChange(e.target.value, item.id, 'operator')
                            }
                            fontSize='sm'
                            placeholder='-- Select Opeator --'
                            onBlur={() => onOperatorBlur(item)}
                          >
                            {item?.list?.map((option) => (
                              <option value={option} key={option}>
                                {updatedValue(option)}
                              </option>
                            ))}
                          </Select>
                          {item?.opError !== '' && (
                            <Text mt={1} color={'red.500'} fontSize={'sm'}>
                              {item?.opError}
                            </Text>
                          )}
                        </FormControl>
                      </GridItem>
                      <GridItem colSpan={6}>
                        <Flex alignItems={'center'} gap={2}>
                          {item?.subject === 'VULNERABILITY_SEV' && (
                            <FormControl isRequired>
                              <Select
                                size='sm'
                                id='operator'
                                name='operator'
                                value={item?.value}
                                onChange={(e) =>
                                  handleChange(e.target.value, item.id, 'value')
                                }
                                textTransform={'capitalize'}
                                fontSize='sm'
                                hidden={
                                  item?.operator === 'EXISTS' ||
                                  item?.operator === 'NOT_EXISTS'
                                }
                              >
                                <option value=''>-- Select --</option>
                                {[
                                  'critical',
                                  'high',
                                  'medium',
                                  'low',
                                  'unknown'
                                ].map((item, index) => (
                                  <option
                                    key={index}
                                    value={item}
                                    style={{ textTransform: 'capitalize' }}
                                  >
                                    {item}
                                  </option>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                          {item?.subject === 'VULNERABILITY_KEV' && (
                            <FormControl isRequired>
                              <Select
                                size='sm'
                                id='operator'
                                name='operator'
                                value={item?.value}
                                onChange={(e) =>
                                  handleChange(e.target.value, item.id, 'value')
                                }
                                textTransform={'capitalize'}
                              >
                                <option value=''>-- Select --</option>
                                {[true, false].map((item, index) => (
                                  <option
                                    key={index}
                                    value={item}
                                    style={{ textTransform: 'capitalize' }}
                                  >
                                    {JSON.stringify(item)}
                                  </option>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                          {item?.subject === 'VULNERABILITY_STATUS' && (
                            <FormControl isRequired>
                              <Select
                                size='sm'
                                id='operator'
                                name='operator'
                                value={item?.value}
                                onChange={(e) =>
                                  handleChange(e.target.value, item.id, 'value')
                                }
                                textTransform={'capitalize'}
                                fontSize='sm'
                                hidden={
                                  item?.operator === 'EXISTS' ||
                                  item?.operator === 'NOT_EXISTS'
                                }
                              >
                                <option value=''>-- Select --</option>
                                {[
                                  'In Triage',
                                  'Not Affected',
                                  'Affected',
                                  'Fixed',
                                  'Unspecified'
                                ].map((item, index) => (
                                  <option
                                    key={index}
                                    value={item}
                                    style={{ textTransform: 'capitalize' }}
                                  >
                                    {item}
                                  </option>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                          {item?.operator === 'RANGE' && (
                            <Stack
                              direction={'column'}
                              alignItems={'flex-start'}
                            >
                              <Flex alignItems={'center'} gap={4}>
                                <InputGroup size='sm'>
                                  <InputLeftAddon>Min</InputLeftAddon>
                                  <Input
                                    width={100}
                                    type={'number'}
                                    name='min'
                                    value={item?.min}
                                    fontSize='sm'
                                    onChange={(e) =>
                                      handleChange(
                                        e.target.value,
                                        item.id,
                                        'min'
                                      )
                                    }
                                    onBlur={() => handleBlur(item)}
                                  />
                                  {item?.subject === 'VULNERABILITY_EPSS' && (
                                    <InputRightAddon>%</InputRightAddon>
                                  )}
                                </InputGroup>
                                <InputGroup size='sm'>
                                  <InputLeftAddon>Max</InputLeftAddon>
                                  <Input
                                    width={100}
                                    type={'number'}
                                    name='max'
                                    value={item?.max}
                                    fontSize='sm'
                                    onChange={(e) =>
                                      handleChange(
                                        e.target.value,
                                        item.id,
                                        'max'
                                      )
                                    }
                                    onBlur={() => handleBlur(item)}
                                  />
                                  {item?.subject === 'VULNERABILITY_EPSS' && (
                                    <InputRightAddon>%</InputRightAddon>
                                  )}
                                </InputGroup>
                              </Flex>
                              {item?.valError !== '' && (
                                <Text color={'red.500'} fontSize={'sm'}>
                                  {item?.valError}
                                </Text>
                              )}
                            </Stack>
                          )}
                          {item?.subject === 'VULNERABILITY_STATUS_AGE' &&
                            (item?.operator === 'LESS_THAN' ||
                              item?.operator === 'MORE_THAN' ||
                              item?.operator === '') && (
                              <InputGroup size='sm'>
                                <Input
                                  type='number'
                                  size='sm'
                                  placeholder='Value'
                                  value={item?.value}
                                  onChange={(e) =>
                                    handleChange(
                                      e.target.value,
                                      item.id,
                                      'value'
                                    )
                                  }
                                  onKeyDown={blockInvalidChar}
                                />
                                <InputRightAddon>Days</InputRightAddon>
                              </InputGroup>
                            )}
                          {item?.subject === 'VULNERABILITY_EPSS' &&
                            (item?.operator === 'LESS_THAN' ||
                              item?.operator === 'MORE_THAN' ||
                              item?.operator === '') && (
                              <InputGroup size='sm'>
                                <Input
                                  type='number'
                                  size='sm'
                                  placeholder='Value'
                                  value={item?.value}
                                  onChange={(e) =>
                                    handleChange(
                                      e.target.value,
                                      item.id,
                                      'value'
                                    )
                                  }
                                  hidden={
                                    item?.operator === 'EXISTS' ||
                                    item?.operator === 'NOT_EXISTS'
                                  }
                                />
                                <InputRightAddon>%</InputRightAddon>
                              </InputGroup>
                            )}
                          {item?.operator !== 'RANGE' &&
                            item?.subject !== 'VULNERABILITY_SEV' &&
                            item?.subject !== 'VULNERABILITY_EPSS' &&
                            item?.subject !== 'VULNERABILITY_STATUS' &&
                            item?.subject !== 'VULNERABILITY_KEV' &&
                            item?.subject !== 'VULNERABILITY_STATUS_AGE' && (
                              <Input
                                type={'text'}
                                size='sm'
                                placeholder='Value'
                                value={item?.value}
                                onChange={(e) =>
                                  handleChange(e.target.value, item.id, 'value')
                                }
                                hidden={
                                  item?.operator === 'EXISTS' ||
                                  item?.operator === 'NOT_EXISTS'
                                }
                              />
                            )}
                          <Flex
                            width={'100%'}
                            gap={4}
                            justifyContent={'space-between'}
                          >
                            <Box>
                              {conditions?.length > 1 &&
                                conditions?.length - 1 !== index && (
                                  <Text>
                                    {operator === 'ALL' ? 'and' : 'or'}
                                  </Text>
                                )}
                            </Box>
                            <IconButton
                              ml={'auto'}
                              size='sm'
                              colorScheme='red'
                              icon={<FaTrash />}
                              onClick={() => deleteRow(item)}
                            />
                          </Flex>
                        </Flex>
                      </GridItem>
                    </Grid>
                  ))}
                {error !== '' && (
                  <Alert status='error' borderRadius={4}>
                    <AlertIcon />
                    <AlertDescription fontSize={'sm'} pr={2}>
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
              </Flex>
            </ModalBody>
            <ModalFooter mt={6}>
              <Button colorScheme='gray' mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme='blue'
                type='submit'
                disabled={errorMessage || error !== ''}
              >
                {data ? 'Update' : 'Save'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  )
}

export default PolicyModal
