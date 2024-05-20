import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { getIcon, getLabel, updatedValue } from 'utils'

import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Icon,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  Kbd,
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
  Textarea,
  Tooltip
} from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'

import { PolicyCreate, PolicyUpdate } from 'graphQL/Mutation'

import { FaPlus, FaTrash } from 'react-icons/fa'

const PolicyModal = ({ data, isOpen, onClose, refetch, plSubjects }) => {
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
  const [isPrimary, setIsPrimary] = useState(false)
  const [isInternal, setIsInternal] = useState(false)
  const [deletedRules, setDeletedRules] = useState([])
  const [isDisabled, setIsDisabled] = useState(false)

  const disableButtonTemporarily = () => {
    setIsDisabled(true)
    setTimeout(() => {
      setIsDisabled(false)
    }, 3000)
  }

  const [createPolicy] = useMutation(PolicyCreate)
  const [updatePolicy] = useMutation(PolicyUpdate)

  const sortedData =
    plSubjects &&
    [...plSubjects].sort((a, b) => a?.subject?.localeCompare(b?.subject))

  const categories = [...new Set(sortedData?.map((item) => item.category))]

  const optionsByCategory = categories.reduce((acc, category) => {
    const options = plSubjects
      .filter((item) => item.category === category)
      .map((item) => (
        <option
          value={item.subject}
          key={item?.subject}
          style={{ textTransform: 'capitalize' }}
        >
          {/* {`${item?.category} ${item.name}`} */}
          {item.name}
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
          const result = plSubjects?.find((item) => item?.subject === value)
          return { ...item, [field]: value, list: result?.operators }
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

  const clearState = () => {
    setName('')
    setOperator('')
    setResultType('')
  }

  const handleCreate = (e) => {
    e.preventDefault()
    disableButtonTemporarily()
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
        excludeInternalComponent: isInternal,
        excludePrimaryComponent: isPrimary,
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
        clearState()
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

  const handleUpdate = (e) => {
    e.preventDefault()
    disableButtonTemporarily()
    if (prevRules?.length > 0) {
      updatePolicy({
        variables: {
          id: data?.id,
          name,
          desc,
          isEnabled: data?.isEnabled,
          excludeInternalComponent: isInternal,
          excludePrimaryComponent: isPrimary,
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
        (operator !== 'exists' && operator !== 'not_exists' && value === '') ||
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
    if (data && plSubjects) {
      console.log(data)
      setName(data?.name || '')
      setDesc(data?.description || '')
      setIsInternal(data?.excludeInternalComponent)
      setIsPrimary(data?.excludePrimaryComponent)
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
        plSubjects?.find((op) => op?.subject === item?.subject)
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
  }, [data, plSubjects])

  return (
    <>
      <Modal
        size='5xl'
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
        motionPreset='slideInBottom'
      >
        <ModalOverlay />
        <form onSubmit={data ? handleUpdate : handleCreate}>
          <ModalContent>
            <ModalHeader>{data ? 'Edit' : 'Create'} Policy</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex
                width={'100%'}
                alignItems={'flex-start'}
                direction={'column'}
                gap={4}
              >
                {/* POLICY NAME */}
                <FormControl isRequired>
                  <FormLabel htmlFor='policyName'>Name</FormLabel>
                  <Input
                    type='text'
                    name='policyName'
                    fontSize='sm'
                    placeholder='Enter name'
                    value={name}
                    onChange={onNameChange}
                  />
                </FormControl>
                {/* POLICY DESCTIPTION */}
                <FormControl>
                  <FormLabel htmlFor='policyDesc'>Description</FormLabel>
                  <Textarea
                    size='sm'
                    type='text'
                    name='policyDesc'
                    placeholder='Enter description'
                    value={desc}
                    onChange={onDescChange}
                  />
                </FormControl>
                {/* POLICY RESULT AND TYPE */}
                <Grid width={'100%'} templateColumns='repeat(2, 1fr)' gap={6}>
                  <GridItem>
                    <FormControl isRequired>
                      <FormLabel htmlFor='policyResult'>
                        Policy Result
                      </FormLabel>
                      <Select
                        id='policyResult'
                        name='policyResult'
                        value={resultType}
                        onChange={onResultChange}
                        placeholder={'-- select --'}
                        fontSize='sm'
                      >
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
                  </GridItem>
                  <GridItem>
                    <FormControl isRequired>
                      <FormLabel htmlFor='policyType'>On Conditions</FormLabel>
                      <Select
                        id='policyType'
                        name='policyType'
                        value={operator}
                        onChange={onOperatorChange}
                        placeholder={'-- select --'}
                        fontSize='sm'
                      >
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
                  </GridItem>
                </Grid>
                <Divider />
                {/* CONDITIONS */}
                <FormControl isRequired>
                  <FormLabel htmlFor='conditions'>Conditions</FormLabel>
                  {conditions?.length > 0 &&
                    conditions?.map((item, index) => (
                      <Flex
                        gap={4}
                        mt={3}
                        key={index}
                        width={'100%'}
                        alignItems={'flex-start'}
                        justifyContent={'space-bewteen'}
                      >
                        <Box hidden={item?.subject === ''} mt={2}>
                          <Tooltip
                            label={getLabel(item?.subject)}
                            placement='top'
                          >
                            <Box>
                              <Icon
                                color='blue.500'
                                as={getIcon(item.subject)}
                              />
                            </Box>
                          </Tooltip>
                        </Box>
                        {/* SUBJECT */}
                        <FormControl width={'30%'}>
                          <Select
                            value={item?.subject}
                            onChange={(e) =>
                              handleChange(e.target.value, item.id, 'subject')
                            }
                            onBlur={() => onSubjectBlur(item)}
                            placeholder='-- subject --'
                            fontSize='sm'
                            onBlurCapture={() => onSubjectBlur(item)}
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
                        {/* OPERATOR */}
                        <FormControl width={'20%'}>
                          <Select
                            id='operator'
                            name='operator'
                            value={item?.operator}
                            onChange={(e) =>
                              handleChange(e.target.value, item.id, 'operator')
                            }
                            fontSize='sm'
                            placeholder='-- operator --'
                            onBlur={() => onOperatorBlur(item)}
                            textTransform={'lowercase'}
                          >
                            {item?.list?.map((option) => (
                              <option
                                value={option}
                                key={option}
                                style={{ textTransform: 'lowercase' }}
                              >
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
                        {/* VALUE */}
                        <Flex alignItems={'center'} gap={4} width={'30%'}>
                          {item?.subject === 'VULNERABILITY_SEV' && (
                            <FormControl isRequired>
                              <Select
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
                                <option value=''>-- select --</option>
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
                                id='operator'
                                name='operator'
                                value={item?.value}
                                fontSize={'sm'}
                                onChange={(e) =>
                                  handleChange(e.target.value, item.id, 'value')
                                }
                                textTransform={'capitalize'}
                              >
                                <option value=''>-- select --</option>
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
                                id='vulnStatus'
                                name='vulnStatus'
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
                                <option value=''>-- select --</option>
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
                          {item?.subject ===
                            'VULNERABILITY_STATUS_COMPLETENESS' &&
                            item?.operator === 'IS' && (
                              <FormControl isRequired>
                                <Select
                                  id='statusCompleteness'
                                  name='statusCompleteness'
                                  value={item?.value}
                                  onChange={(e) =>
                                    handleChange(
                                      e.target.value,
                                      item.id,
                                      'value'
                                    )
                                  }
                                  textTransform={'capitalize'}
                                  fontSize='sm'
                                >
                                  <option value=''>-- select --</option>
                                  {['complete', 'incomplete'].map(
                                    (item, index) => (
                                      <option
                                        key={index}
                                        value={item}
                                        style={{ textTransform: 'capitalize' }}
                                      >
                                        {item}
                                      </option>
                                    )
                                  )}
                                </Select>
                              </FormControl>
                            )}
                          {item?.subject === 'COMPONENT_TYPE' &&
                            (item?.operator === 'IS' ||
                              item?.operator === 'IS_NOT' ||
                              item?.operator === '') && (
                              <FormControl isRequired>
                                <Select
                                  id='compType'
                                  name='compType'
                                  value={item?.value}
                                  onChange={(e) =>
                                    handleChange(
                                      e.target.value,
                                      item.id,
                                      'value'
                                    )
                                  }
                                  textTransform={'capitalize'}
                                  fontSize='sm'
                                >
                                  <option value=''>-- select --</option>
                                  {[
                                    'application',
                                    'framework',
                                    'library',
                                    'container',
                                    'platform',
                                    'operating-system',
                                    'device',
                                    'device-driver',
                                    'firmware',
                                    'file',
                                    'machine-learning-model',
                                    'data'
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
                                <InputGroup>
                                  <InputLeftAddon fontSize={'sm'}>
                                    Min
                                  </InputLeftAddon>
                                  <Input
                                    width={16}
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
                                    <InputRightAddon fontSize={'sm'}>
                                      %
                                    </InputRightAddon>
                                  )}
                                  {item?.subject ===
                                    'VULNERABILITY_STATUS_AGE' && (
                                    <InputRightAddon fontSize={'sm'}>
                                      Days
                                    </InputRightAddon>
                                  )}
                                </InputGroup>
                                <InputGroup>
                                  <InputLeftAddon fontSize={'sm'}>
                                    Max
                                  </InputLeftAddon>
                                  <Input
                                    width={16}
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
                                    <InputRightAddon fontSize={'sm'}>
                                      %
                                    </InputRightAddon>
                                  )}
                                  {item?.subject ===
                                    'VULNERABILITY_STATUS_AGE' && (
                                    <InputRightAddon fontSize={'sm'}>
                                      Days
                                    </InputRightAddon>
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
                              <InputGroup>
                                <Input
                                  type='number'
                                  fontSize={'sm'}
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
                                <InputRightAddon fontSize={'sm'}>
                                  Days
                                </InputRightAddon>
                              </InputGroup>
                            )}
                          {item?.subject === 'VULNERABILITY_EPSS' &&
                            (item?.operator === 'LESS_THAN' ||
                              item?.operator === 'MORE_THAN' ||
                              item?.operator === '') && (
                              <InputGroup>
                                <Input
                                  type='number'
                                  fontSize='sm'
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
                            item?.subject !== 'COMPONENT_TYPE' &&
                            item?.subject !== 'VERSION_PRIMARY' &&
                            item?.subject !==
                              'VULNERABILITY_STATUS_COMPLETENESS' &&
                            item?.subject !==
                              'SBOM_PRIMARY_COMPONENT_RELATIONSHIPS' &&
                            item?.subject !== 'VULNERABILITY_SEV' &&
                            item?.subject !== 'VULNERABILITY_EPSS' &&
                            item?.subject !== 'VULNERABILITY_STATUS' &&
                            item?.subject !== 'VULNERABILITY_KEV' &&
                            item?.subject !== 'VULNERABILITY_STATUS_AGE' && (
                              <Input
                                type={'text'}
                                fontSize='sm'
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
                          <Flex gap={4} justifyContent={'space-between'}>
                            {conditions?.length > 1 &&
                              conditions?.length - 1 !== index && (
                                <Kbd mt={2}>
                                  {operator === 'ALL' ? 'AND' : 'OR'}
                                </Kbd>
                              )}
                            {conditions?.length > 1 && (
                              <Icon
                                ml={'auto'}
                                mt={2}
                                as={FaTrash}
                                color={'red.500'}
                                cursor={'pointer'}
                                onClick={() => deleteRow(item)}
                              />
                            )}
                          </Flex>
                        </Flex>
                      </Flex>
                    ))}
                </FormControl>
                {/* ADD CONDITIONS */}
                <Button
                  fontSize={'sm'}
                  colorScheme='blue'
                  variant='link'
                  fontWeight={'medium'}
                  leftIcon={<FaPlus />}
                  onClick={addRow}
                >
                  Add condition
                </Button>
                <Divider />
                {/* APPLY CONDITION */}
                <FormControl>
                  <FormLabel htmlFor='doesNptapplyTo'>
                    Does not apply to
                  </FormLabel>
                  <Stack spacing={5} direction='row' mt={3}>
                    <Checkbox
                      isChecked={isPrimary}
                      onChange={(e) => setIsPrimary(e.target.checked)}
                    >
                      <Text fontSize={'sm'}>Primary Component</Text>
                    </Checkbox>
                    <Checkbox
                      isChecked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                    >
                      <Text fontSize={'sm'}>Internal Components</Text>
                    </Checkbox>
                  </Stack>
                </FormControl>
                {/* ERROR HANDLING */}
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
                disabled={errorMessage || error !== '' || isDisabled}
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
