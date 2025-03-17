import { formatString } from 'utils'
import {
  componentTypes,
  licenseStatusTypes,
  severityList,
  vulnStatusTypes
} from 'variables/general'

import { Flex, FormControl, Stack, Text } from '@chakra-ui/react'
import { Icon, IconButton } from '@chakra-ui/react'
import {
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon
} from '@chakra-ui/react'

import LynkSelect from 'components/LynkSelect'

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

  const severityOptions = [
    { label: '-- Select --', value: '' },
    ...severityList.map((item) => ({
      value: item,
      label: formatString(item)
    }))
  ]

  const kevOptions = [
    { label: '-- Select --', value: '' },
    { label: 'True', value: 'true' },
    { label: 'False', value: 'false' }
  ]

  const vulnStatusOptions = [
    { label: '-- Select --', value: '' },
    ...vulnStatusTypes.map((status) => ({
      label: status,
      value: status
    }))
  ]

  const statusCompletenessOptions = [
    { label: '-- Select --', value: '' },
    { label: 'Complete', value: 'complete' },
    { label: 'Incomplete', value: 'incomplete' }
  ]

  const licenseOptions = [
    { label: '-- Select --', value: '' },
    ...licenseStatusTypes.map((item) => ({
      value: String(item),
      label: String(item)
    }))
  ]

  const selectStyles = {
    container: (baseStyles) => ({
      ...baseStyles,
      minWidth: '150px'
    })
  }

  return (
    <Flex alignItems={'center'} gap={4}>
      {subject === 'VULNERABILITY_SEV' && (
        <FormControl isRequired>
          <LynkSelect
            id='operator'
            name='operator'
            value={severityOptions.find((opt) => opt.value === value)}
            onChange={(option) => onChange(option?.value || '', id, 'value')}
            options={severityOptions}
            dropDown
            placeholder={'-- Select --'}
            isDisabled={operator === 'EXISTS' || operator === 'NOT_EXISTS'}
            styles={selectStyles}
          />
        </FormControl>
      )}
      {subject === 'VULNERABILITY_KEV' && (
        <FormControl isRequired minWidth={140}>
          <LynkSelect
            id='operator'
            name='operator'
            value={kevOptions.find((opt) => opt.value === value)}
            onChange={(option) => onChange(option?.value || '', id, 'value')}
            options={kevOptions}
            dropDown
            placeholder={'-- Select --'}
            styles={selectStyles}
          />
        </FormControl>
      )}
      {subject === 'VULNERABILITY_STATUS' && (
        <FormControl isRequired minWidth={140}>
          <LynkSelect
            id='vulnStatus'
            name='vulnStatus'
            value={vulnStatusOptions.find((opt) => opt.value === value)}
            onChange={(option) => onChange(option?.value || '', id, 'value')}
            options={vulnStatusOptions}
            hidden={operator === 'EXISTS' || operator === 'NOT_EXISTS'}
            dropDown
            placeholder={'-- Select --'}
            styles={selectStyles}
          />
        </FormControl>
      )}
      {subject === 'VULNERABILITY_STATUS_COMPLETENESS' && operator === 'IS' && (
        <FormControl isRequired minWidth={140}>
          <LynkSelect
            id='statusCompleteness'
            name='statusCompleteness'
            value={statusCompletenessOptions.find((opt) => opt.value === value)}
            onChange={(option) => onChange(option?.value || '', id, 'value')}
            options={statusCompletenessOptions}
            dropDown
            placeholder={'-- Select --'}
            styles={selectStyles}
          />
        </FormControl>
      )}
      {subject === 'COMPONENT_LICENSE_STATUS' &&
        (operator === 'IS' || operator === 'IS_NOT') && (
          <FormControl isRequired>
            <LynkSelect
              id='compLicenseStatus'
              name='compLicenseStatus'
              value={licenseOptions.find((opt) => opt.value === String(value))}
              onChange={(option) => onChange(option?.value || '', id, 'value')}
              options={licenseOptions}
              placeholder={'-- Select --'}
              dropDown
              styles={selectStyles}
            />
          </FormControl>
        )}
      {subject === 'COMPONENT_TYPE' &&
        (operator === 'IS' || operator === 'IS_NOT' || operator === '') && (
          <FormControl isRequired>
            <LynkSelect
              id='compType'
              name='compType'
              value={componentTypes.find((item) => item.value === value) || ''}
              onChange={(selectedOption) =>
                onChange(selectedOption?.value, id, 'value')
              }
              options={componentTypes}
              placeholder={'-- Select --'}
              dropDown={true}
              width={'100%'}
              styles={selectStyles}
            />
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
