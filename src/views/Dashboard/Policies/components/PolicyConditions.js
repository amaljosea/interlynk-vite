import { updatedValue } from 'utils'
import { getIcon } from 'utils/styleUtils'
import { componentTypes } from 'variables/general'

import {
  Box,
  Flex,
  FormControl,
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
  Text
} from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { MdDeleteOutline } from 'react-icons/md'
import { vulnStatusTypes } from 'variables/general'

const PolicyConditions = ({
  conditions,
  setConditions,
  setError,
  setDeletedRules,
  plSubjects,
  formData
}) => {
  const { primaryErrorColor, primaryBlueText, grayBorderColor } = useThemeColor(
    ['primaryErrorColor', 'primaryBlueText', 'grayBorderColor']
  )

  const sortedData =
    plSubjects &&
    [...plSubjects].sort((a, b) => a?.subject?.localeCompare(b?.subject))

  const categories = [...new Set(sortedData?.map((item) => item.category))]

  const optionsByCategory = categories.reduce((acc, category) => {
    const options = plSubjects
      .filter((item) => item.category === category)
      .map((item, index) => (
        <option
          key={index}
          value={item.subject}
          style={{ textTransform: 'capitalize' }}
        >
          {/* {`${item?.category} ${item.name}`} */}
          {item.name}
        </option>
      ))
    acc[category] = options
    return acc
  }, {})

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

  const deleteRow = (rule) => {
    setError('')
    const newData = conditions?.filter((item) => item.id !== rule?.id)
    setConditions(newData)
    if (rule?.status === 'ADDED') {
      setDeletedRules((prev) => [...prev, rule])
    }
  }

  const blockInvalidChar = (e) =>
    ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()

  return (
    <>
      {conditions?.length > 0 &&
        conditions?.map((item, index) => (
          <Box key={index}>
            <Flex
              gap={2}
              mt={1.5}
              width={'100%'}
              alignItems={'flex-start'}
              justifyContent={'space-bewteen'}
            >
              <InputGroup>
                <InputLeftElement pointerEvents='none'>
                  <Icon color={primaryBlueText} as={getIcon(item.subject)} />
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
                    data-testid={`condition_subject_${index}`}
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
                  data-testid={`condition_operator_${index}`}
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
                      {['critical', 'high', 'medium', 'low', 'unknown'].map(
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
                      {vulnStatusTypes.map((item, index) => (
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
                        <InputLeftAddon sx={{ w: 9, p: 1, fontSize: 'xs' }}>
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
                        <InputLeftAddon width={9} padding={1} fontSize={'xs'}>
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
                      <InputRightAddon fontSize={'sm'}>Days</InputRightAddon>
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
                  item?.subject !== 'SBOM_PRIMARY_COMPONENT_RELATIONSHIPS' &&
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
                      borderColor={grayBorderColor}
                      aria-label='Remove condition'
                      onClick={() => deleteRow(item)}
                      icon={
                        <Icon
                          sx={{ w: 6, h: 6, color: primaryErrorColor }}
                          as={MdDeleteOutline}
                        />
                      }
                    />
                  )}
                </Flex>
              </Flex>
            </Flex>
            {conditions?.length > 1 && conditions?.length - 1 !== index && (
              <Tag mt={1.5} p={1}>
                <Text fontSize={10} fontWeight={600}>
                  {formData?.operator === 'ALL' ? 'AND' : 'OR'}
                </Text>
              </Tag>
            )}
          </Box>
        ))}
    </>
  )
}

export default PolicyConditions
