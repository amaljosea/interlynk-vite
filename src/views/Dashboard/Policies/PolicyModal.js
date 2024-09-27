import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { getIcon, getLabel, updatedValue } from 'utils'
import { componentTypes } from 'variables/general'

import {
  Button,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftAddon,
  InputLeftElement,
  InputRightAddon,
  Select,
  Stack,
  Tag,
  Text,
  Textarea,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

import { useThemeColor } from 'hooks/useThemeColors'

import { PolicyCreate, PolicyUpdate } from 'graphQL/Mutation'

import { FaPlus } from 'react-icons/fa6'
import { MdDeleteOutline, MdPolicy } from 'react-icons/md'

const PolicyModal = ({ data, isOpen, onClose, plSubjects }) => {
  const initialState = {
    name: '',
    desc: '',
    operator: '',
    resultType: '',
    isPrimary: false,
    isInternal: false
  }
  const [formData, setFormData] = useState(initialState)
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

  const { primaryErrorColor, primaryBlueText } = useThemeColor([
    'primaryErrorColor',
    'primaryBlueText'
  ])
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const [createPolicy, { loading: crLoading }] = useMutation(PolicyCreate)
  const [updatePolicy, { loading: upLoading }] = useMutation(PolicyUpdate)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setError('')
  }

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

  const onChangeRule = (value, id, field) => {
    setError('')
    const newData = conditions.map((item) => {
      if (item.id === id) {
        if (field === 'subject' && value === '') {
          return {
            ...item,
            [field]: value,
            subError: 'Please select any subject'
          }
        } else if (field === 'subject' && value !== '') {
          const result = plSubjects?.find((item) => item?.subject === value)
          return {
            ...item,
            [field]: value,
            list: result?.operators,
            subError: ''
          }
        } else if (field === 'operator' && value === '') {
          return {
            ...item,
            [field]: value,
            opError: 'Please select any operator'
          }
        } else if (field === 'operator' && value !== '') {
          return {
            ...item,
            [field]: value,
            opError: ''
          }
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
    setFormData(initialState)
    onClose()
  }

  const handleCreate = () => {
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
        name: formData?.name,
        desc: formData?.desc,
        isEnabled: true,
        excludeInternalComponent: formData?.isInternal,
        excludePrimaryComponent: formData?.isPrimary,
        operator: formData?.operator || undefined,
        resultType: formData?.resultType || undefined,
        policyRulesAttributes: rules?.length > 0 ? rules : undefined
      }
    }).then((res) => {
      const errors = res?.data?.policyCreate?.errors
      if (errors?.length > 0) {
        setError(errors[0])
      } else {
        setError('')
        clearState()
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

  const inputData = (rules) => {
    return {
      id: data?.id,
      name: formData?.name,
      desc: formData?.desc,
      isEnabled: data?.isEnabled,
      policyRulesAttributes: rules,
      operator: formData?.operator || undefined,
      excludePrimaryComponent: formData?.isPrimary,
      resultType: formData?.resultType || undefined,
      excludeInternalComponent: formData?.isInternal
    }
  }

  const handleUpdate = () => {
    if (prevRules?.length > 0) {
      updatePolicy({ variables: inputData(prevRules) }).then((res) => {
        const errors = res?.data?.policyUpdate?.errors
        if (errors?.length > 0) {
          setError(errors[0])
        } else {
          clearState()
        }
      })
    }
    if (newRules?.length > 0) {
      updatePolicy({ variables: inputData(newRules) }).then((res) => {
        const errors = res?.data?.policyUpdate?.errors
        if (errors?.length > 0) {
          setError(errors[0])
        } else {
          clearState()
        }
      })
    }
    if (deleteRules?.length > 0) {
      updatePolicy({ variables: inputData(deleteRules) }).then((res) => {
        const errors = res?.data?.policyUpdate?.errors
        if (errors?.length > 0) {
          setError(errors[0])
        } else {
          clearState()
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
        (operator !== 'EXISTS' && operator !== 'NOT_EXISTS' && value === '') ||
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
      const getOperator = (operator) => {
        const upperOperator = operator?.toUpperCase()
        return upperOperator === 'ANY' || upperOperator === 'ALL'
          ? upperOperator
          : ''
      }
      const getResultType = (resultType) => {
        const upperResultType = resultType?.toUpperCase()
        return upperResultType === 'WARN' || upperResultType === 'INFORM'
          ? upperResultType
          : 'FAIL'
      }
      setFormData(() => ({
        name: data?.name,
        desc: data?.description,
        operator: getOperator(data?.operator),
        isPrimary: data?.excludeInternalComponent,
        isInternal: data?.excludeInternalComponent,
        resultType: getResultType(data?.resultType)
      }))
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
      <LynkModal
        isOpen={isOpen}
        Icon={MdPolicy}
        onClose={onClose}
        buttonText={data ? 'Update' : 'Save'}
        disabled={errorMessage || error !== ''}
        isLoading={data ? upLoading : crLoading}
        title={`${data ? 'Edit' : 'Create'} Policy`}
        onSubmit={data ? handleUpdate : handleCreate}
      >
        <Flex
          width={'100%'}
          alignItems={'flex-start'}
          direction={'column'}
          gap={4}
        >
          {/* POLICY NAME */}
          <FormControl isRequired>
            <FormLabel htmlFor='name' fontSize={12}>
              Name
            </FormLabel>
            <Input
              type='text'
              name='name'
              fontSize='sm'
              placeholder='Enter name'
              value={formData?.name}
              onChange={handleChange}
            />
          </FormControl>
          {/* POLICY DESCTIPTION */}
          <FormControl>
            <FormLabel htmlFor='desc' fontSize={12}>
              Description
            </FormLabel>
            <Textarea
              size='sm'
              type='text'
              name='desc'
              value={formData?.desc}
              onChange={handleChange}
              placeholder='Enter description'
            />
          </FormControl>
          {/* POLICY RESULT AND TYPE */}
          <FormControl isRequired>
            <FormLabel htmlFor='resultType' fontSize={12}>
              Policy Result
            </FormLabel>
            <Select
              fontSize='sm'
              name='resultType'
              onChange={handleChange}
              value={formData?.resultType}
              placeholder={'-- select --'}
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
          <FormControl isRequired>
            <FormLabel htmlFor='operator' fontSize={12}>
              On Conditions
            </FormLabel>
            <Select
              fontSize='sm'
              name='operator'
              onChange={handleChange}
              value={formData?.operator}
              placeholder={'-- select --'}
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
          <Divider />
          {/* CONDITIONS */}
          <FormControl isRequired>
            <FormLabel htmlFor='conditions' fontSize={12}>
              Conditions
            </FormLabel>
            {conditions?.length > 0 &&
              conditions?.map((item, index) => (
                <>
                  <Flex
                    gap={2}
                    mt={1.5}
                    key={index}
                    width={'100%'}
                    alignItems={'flex-start'}
                    justifyContent={'space-bewteen'}
                  >
                    <InputGroup>
                      <InputLeftElement pointerEvents='none'>
                        <Tooltip
                          label={
                            item?.subject !== '' && getLabel(item?.subject)
                          }
                          placement='top'
                        >
                          <Icon
                            color={primaryBlueText}
                            as={getIcon(item.subject)}
                          />
                        </Tooltip>
                      </InputLeftElement>
                      {/* SUBJECT */}
                      <FormControl>
                        <Select
                          fontSize='sm'
                          value={item?.subject}
                          onChange={(e) =>
                            onChangeRule(e.target.value, item.id, 'subject')
                          }
                          placeholder='-- subject --'
                          sx={{ paddingLeft: '34px' }}
                        >
                          {categories.map((category) => (
                            <optgroup key={category} label={category}>
                              {optionsByCategory[category]}
                            </optgroup>
                          ))}
                        </Select>
                        {item?.subError !== '' && (
                          <Text mt={1} color={primaryErrorColor} fontSize='sm'>
                            {item?.subError}
                          </Text>
                        )}
                      </FormControl>
                    </InputGroup>
                    {/* OPERATOR */}
                    <FormControl>
                      <Select
                        id='operator'
                        name='operator'
                        fontSize='sm'
                        value={item?.operator}
                        onChange={(e) =>
                          onChangeRule(e.target.value, item.id, 'operator')
                        }
                        placeholder='-- operator --'
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
                        <Text mt={1} color={primaryErrorColor} fontSize={'sm'}>
                          {item?.opError}
                        </Text>
                      )}
                    </FormControl>
                    {/* VALUE */}
                    <Flex alignItems={'center'} gap={4}>
                      {item?.subject === 'VULNERABILITY_SEV' && (
                        <FormControl isRequired minWidth={140}>
                          <Select
                            id='operator'
                            name='operator'
                            value={item?.value}
                            onChange={(e) =>
                              onChangeRule(e.target.value, item.id, 'value')
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
                        <FormControl isRequired minWidth={140}>
                          <Select
                            id='operator'
                            name='operator'
                            value={item?.value}
                            fontSize={'sm'}
                            onChange={(e) =>
                              onChangeRule(e.target.value, item.id, 'value')
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
                        <FormControl isRequired minWidth={140}>
                          <Select
                            id='vulnStatus'
                            name='vulnStatus'
                            value={item?.value}
                            onChange={(e) =>
                              onChangeRule(e.target.value, item.id, 'value')
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
                      {item?.subject === 'VULNERABILITY_STATUS_COMPLETENESS' &&
                        item?.operator === 'IS' && (
                          <FormControl isRequired minWidth={140}>
                            <Select
                              id='statusCompleteness'
                              name='statusCompleteness'
                              value={item?.value}
                              onChange={(e) =>
                                onChangeRule(e.target.value, item.id, 'value')
                              }
                              textTransform={'capitalize'}
                              fontSize='sm'
                            >
                              <option value=''>-- select --</option>
                              {['complete', 'incomplete'].map((item, index) => (
                                <option
                                  key={index}
                                  value={item}
                                  style={{
                                    textTransform: 'capitalize'
                                  }}
                                >
                                  {item}
                                </option>
                              ))}
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
                                onChangeRule(e.target.value, item.id, 'value')
                              }
                              textTransform={'capitalize'}
                              fontSize='sm'
                              minWidth={140}
                            >
                              <option value=''>-- select --</option>
                              {componentTypes?.map((item, index) => (
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
                        <Stack direction={'column'} alignItems={'flex-start'}>
                          <Flex alignItems={'center'} gap={2}>
                            <InputGroup>
                              <InputLeftAddon
                                sx={{ w: 9, p: 1, fontSize: 'xs' }}
                              >
                                Min
                              </InputLeftAddon>
                              <Input
                                sx={{ w: 10, p: 0, textAlign: 'center' }}
                                type={'number'}
                                name='min'
                                value={item?.min}
                                fontSize='sm'
                                onChange={(e) =>
                                  onChangeRule(e.target.value, item.id, 'min')
                                }
                                onBlur={() => handleBlur(item)}
                              />
                              {item?.subject === 'VULNERABILITY_EPSS' && (
                                <InputRightAddon
                                  display={'flex'}
                                  justifyContent={'center'}
                                  sx={{ w: 9, p: 1, fontSize: 'xs' }}
                                >
                                  %
                                </InputRightAddon>
                              )}
                              {item?.subject === 'VULNERABILITY_STATUS_AGE' && (
                                <InputRightAddon
                                  display={'flex'}
                                  justifyContent={'center'}
                                  sx={{ w: 9, p: 1, fontSize: 'xs' }}
                                >
                                  Days
                                </InputRightAddon>
                              )}
                            </InputGroup>
                            <InputGroup>
                              <InputLeftAddon
                                width={9}
                                padding={1}
                                fontSize={'xs'}
                              >
                                Max
                              </InputLeftAddon>
                              <Input
                                sx={{ w: 10, p: 0, textAlign: 'center' }}
                                type={'number'}
                                name='max'
                                value={item?.max}
                                fontSize='sm'
                                onChange={(e) =>
                                  onChangeRule(e.target.value, item.id, 'max')
                                }
                                onBlur={() => handleBlur(item)}
                              />
                              {item?.subject === 'VULNERABILITY_EPSS' && (
                                <InputRightAddon
                                  display={'flex'}
                                  justifyContent={'center'}
                                  sx={{ w: 9, p: 1, fontSize: 'xs' }}
                                >
                                  %
                                </InputRightAddon>
                              )}
                              {item?.subject === 'VULNERABILITY_STATUS_AGE' && (
                                <InputRightAddon
                                  display={'flex'}
                                  justifyContent={'center'}
                                  sx={{ w: 9, p: 1, fontSize: 'xs' }}
                                >
                                  Days
                                </InputRightAddon>
                              )}
                            </InputGroup>
                          </Flex>
                          {item?.valError !== '' && (
                            <Text color={primaryErrorColor} fontSize={'sm'}>
                              {item?.valError}
                            </Text>
                          )}
                        </Stack>
                      )}
                      {item?.subject === 'VULNERABILITY_STATUS_AGE' &&
                        (item?.operator === 'LESS_THAN' ||
                          item?.operator === 'MORE_THAN' ||
                          item?.operator === '') && (
                          <InputGroup minWidth={140}>
                            <Input
                              type='number'
                              fontSize={'sm'}
                              placeholder='Value'
                              value={item?.value}
                              onChange={(e) =>
                                onChangeRule(e.target.value, item.id, 'value')
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
                          <InputGroup minWidth={140}>
                            <Input
                              padding={2}
                              type='number'
                              fontSize='sm'
                              placeholder='Value'
                              value={item?.value}
                              onChange={(e) =>
                                onChangeRule(e.target.value, item.id, 'value')
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
                        item?.subject !== 'VULNERABILITY_STATUS_COMPLETENESS' &&
                        item?.subject !==
                          'SBOM_PRIMARY_COMPONENT_RELATIONSHIPS' &&
                        item?.subject !== 'VULNERABILITY_SEV' &&
                        item?.subject !== 'VULNERABILITY_EPSS' &&
                        item?.subject !== 'VULNERABILITY_STATUS' &&
                        item?.subject !== 'VULNERABILITY_KEV' &&
                        item?.subject !== 'VULNERABILITY_STATUS_AGE' &&
                        item?.operator !== 'EXISTS' &&
                        item?.operator !== 'NOT_EXISTS' && (
                          <Input
                            type={'text'}
                            fontSize='sm'
                            placeholder='Value'
                            value={item?.value}
                            onChange={(e) =>
                              onChangeRule(e.target.value, item.id, 'value')
                            }
                            minWidth={140}
                          />
                        )}
                      <Flex gap={4} justifyContent={'space-between'}>
                        {conditions?.length > 1 && (
                          <IconButton
                            border='1px solid'
                            colorScheme='white'
                            borderColor={borderColor}
                            aria-label='Remove condition'
                            onClick={() => deleteRow(item)}
                            icon={
                              <Icon
                                sx={{ w: 6, h: 6, color: '#E53E3E' }}
                                as={MdDeleteOutline}
                              />
                            }
                          />
                        )}
                      </Flex>
                    </Flex>
                  </Flex>
                  {conditions?.length > 1 &&
                    conditions?.length - 1 !== index && (
                      <Tag mt={1.5} p={1}>
                        <Text fontSize={10} fontWeight={600}>
                          {formData?.operator === 'ALL' ? 'AND' : 'OR'}
                        </Text>
                      </Tag>
                    )}
                </>
              ))}
          </FormControl>
          {/* ADD CONDITIONS */}
          <Button
            variant='link'
            onClick={addRow}
            colorScheme='blue'
            leftIcon={<FaPlus />}
            sx={{ fontSize: 'sm', fontWeight: 'medium', pl: '2px' }}
          >
            Add condition
          </Button>
          <Divider />
          {/* APPLY CONDITION */}
          <FormControl>
            <FormLabel htmlFor='doesNptapplyTo' fontSize={12}>
              Does not apply to
            </FormLabel>
            <Stack spacing={5} mt={3}>
              <Checkbox
                name={'isPrimary'}
                isChecked={formData?.isPrimary}
                onChange={handleChange}
              >
                <Text fontSize={12}>Primary Component</Text>
              </Checkbox>
              <Checkbox
                name={'isInternal'}
                onChange={handleChange}
                isChecked={formData?.isInternal}
              >
                <Text fontSize={12}>Internal Components</Text>
              </Checkbox>
            </Stack>
          </FormControl>
          {/* ERROR HANDLING */}
          {error !== '' && <LynkAlert msg={error} />}
        </Flex>
      </LynkModal>
    </>
  )
}

export default PolicyModal
