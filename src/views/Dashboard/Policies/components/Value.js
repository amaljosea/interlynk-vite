import {
  componentTypes,
  licenseStatusTypes,
  severityList,
  vulnStatusTypes
} from 'variables/general'

import { Flex, FormControl, Select, Stack, Text } from '@chakra-ui/react'
import { Icon, IconButton } from '@chakra-ui/react'
import {
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon
} from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { MdDeleteOutline } from 'react-icons/md'

const Value = (props) => {
  const {
    setError,
    setConditions,
    setDeletedRules,
    data,
    conditions,
    onChange
  } = props
  const { id, value, min, max, valError, operator, subject } = data || {}

  const { primaryErrorColor, grayBorderColor } = useThemeColor([
    'primaryErrorColor',
    'grayBorderColor'
  ])

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
    <Flex alignItems={'center'} gap={4}>
      {subject === 'VULNERABILITY_SEV' && (
        <FormControl isRequired minWidth={140}>
          <Select
            id='operator'
            name='operator'
            value={value}
            onChange={(e) => onChange(e.target.value, id, 'value')}
            textTransform={'capitalize'}
            hidden={operator === 'EXISTS' || operator === 'NOT_EXISTS'}
          >
            <option value=''>-- select --</option>
            {severityList.map((item, index) => (
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
      {subject === 'VULNERABILITY_KEV' && (
        <FormControl isRequired minWidth={140}>
          <Select
            id='operator'
            name='operator'
            value={value}
            onChange={(e) => onChange(e.target.value, id, 'value')}
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
      {subject === 'VULNERABILITY_STATUS' && (
        <FormControl isRequired minWidth={140}>
          <Select
            id='vulnStatus'
            name='vulnStatus'
            value={value}
            onChange={(e) => onChange(e.target.value, id, 'value')}
            textTransform={'capitalize'}
            hidden={operator === 'EXISTS' || operator === 'NOT_EXISTS'}
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
      {subject === 'VULNERABILITY_STATUS_COMPLETENESS' && operator === 'IS' && (
        <FormControl isRequired minWidth={140}>
          <Select
            id='statusCompleteness'
            name='statusCompleteness'
            value={value}
            onChange={(e) => onChange(e.target.value, id, 'value')}
            textTransform={'capitalize'}
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
      {subject === 'COMPONENT_LICENSE_STATUS' &&
        (operator === 'IS' || operator === 'IS_NOT') && (
          <FormControl isRequired>
            <Select
              id='compLicenseStatus'
              name='compLicenseStatus'
              value={value}
              onChange={(e) => onChange(e.target.value, id, 'value')}
              textTransform={'capitalize'}
              minWidth={140}
            >
              <option value=''>-- select --</option>
              {licenseStatusTypes.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </FormControl>
        )}
      {subject === 'COMPONENT_TYPE' &&
        (operator === 'IS' || operator === 'IS_NOT' || operator === '') && (
          <FormControl isRequired>
            <Select
              id='compType'
              name='compType'
              value={value}
              onChange={(e) => onChange(e.target.value, id, 'value')}
              textTransform={'capitalize'}
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
      {operator === 'RANGE' && (
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
                value={min}
                fontSize='sm'
                onChange={(e) => onChange(e.target.value, id, 'min')}
                onBlur={() => handleBlur(data)}
              />
              {subject === 'VULNERABILITY_EPSS' && (
                <InputRightAddon
                  display={'flex'}
                  justifyContent={'center'}
                  sx={{ w: 9, p: 1, fontSize: 'xs' }}
                >
                  %
                </InputRightAddon>
              )}
              {subject === 'VULNERABILITY_STATUS_AGE' && (
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
                value={max}
                fontSize='sm'
                onChange={(e) => onChange(e.target.value, id, 'max')}
                onBlur={() => handleBlur(data)}
              />
              {subject === 'VULNERABILITY_EPSS' && (
                <InputRightAddon
                  display={'flex'}
                  justifyContent={'center'}
                  sx={{ w: 9, p: 1, fontSize: 'xs' }}
                >
                  %
                </InputRightAddon>
              )}
              {subject === 'VULNERABILITY_STATUS_AGE' && (
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
          {valError !== '' && (
            <Text color={primaryErrorColor} fontSize={'sm'}>
              {valError}
            </Text>
          )}
        </Stack>
      )}
      {subject === 'VULNERABILITY_STATUS_AGE' &&
        (operator === 'LESS_THAN' ||
          operator === 'MORE_THAN' ||
          operator === '') && (
          <InputGroup minWidth={140}>
            <Input
              type='number'
              fontSize={'sm'}
              placeholder='Value'
              value={value}
              onChange={(e) => onChange(e.target.value, id, 'value')}
              onKeyDown={blockInvalidChar}
            />
            <InputRightAddon fontSize={'sm'}>Days</InputRightAddon>
          </InputGroup>
        )}
      {subject === 'VULNERABILITY_EPSS' &&
        (operator === 'LESS_THAN' ||
          operator === 'MORE_THAN' ||
          operator === '') && (
          <InputGroup minWidth={140}>
            <Input
              padding={2}
              type='number'
              fontSize='sm'
              placeholder='Value'
              value={value}
              onChange={(e) => onChange(e.target.value, id, 'value')}
              hidden={operator === 'EXISTS' || operator === 'NOT_EXISTS'}
            />
            <InputRightAddon>%</InputRightAddon>
          </InputGroup>
        )}
      {operator !== 'RANGE' &&
        subject !== 'COMPONENT_TYPE' &&
        subject !== 'VERSION_PRIMARY' &&
        subject !== 'VULNERABILITY_STATUS_COMPLETENESS' &&
        subject !== 'SBOM_PRIMARY_COMPONENT_RELATIONSHIPS' &&
        subject !== 'VULNERABILITY_SEV' &&
        subject !== 'VULNERABILITY_EPSS' &&
        subject !== 'VULNERABILITY_STATUS' &&
        subject !== 'VULNERABILITY_KEV' &&
        subject !== 'VULNERABILITY_STATUS_AGE' &&
        subject !== 'COMPONENT_LICENSE_STATUS' &&
        operator !== 'EXISTS' &&
        operator !== 'NOT_EXISTS' && (
          <Input
            type={'text'}
            fontSize='sm'
            placeholder='Value'
            value={value}
            onChange={(e) => onChange(e.target.value, id, 'value')}
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
            onClick={() => deleteRow(data)}
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
  )
}

export default Value
