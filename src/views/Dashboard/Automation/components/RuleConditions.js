import { components } from 'react-select'
import { updatedValue } from 'utils'

import { Box, Flex, Input, Tag, Text } from '@chakra-ui/react'
import { Icon, IconButton } from '@chakra-ui/react'
import { FormControl, FormErrorMessage } from '@chakra-ui/react'

import LynkSelect from 'components/LynkSelect'

import { useThemeColor } from 'hooks/useThemeColors'

import { MdDeleteOutline } from 'react-icons/md'

import SubjectIcon from './SubjectIcon'

const RuleConditions = ({
  actions,
  isSystem,
  setError,
  categories,
  conditions,
  setActions,
  setConditions,
  setDeleteAction,
  optionsByCategory,
  setDeletedCondition,
  automationConditionSubjectFieldMapping
}) => {
  const { grayBorderColor, primaryErrorColor } = useThemeColor([
    'grayBorderColor',
    'primaryErrorColor'
  ])

  const onCondtionChange = (value, id, field) => {
    setError('')
    const newData = conditions.map((item) => {
      if (item.id === id) {
        if (field === 'subject' && value === '') {
          return {
            ...item,
            value: '',
            [field]: value,
            subError: 'Select any subject'
          }
        } else if (field === 'subject' && value !== '') {
          const result = automationConditionSubjectFieldMapping?.find(
            (item) => item?.key === value
          )
          return {
            ...item,
            value: '',
            [field]: value,
            subError: '',
            category: result?.subject,
            list: result?.operators
          }
        } else if (field === 'operator' && value === '') {
          return {
            ...item,
            value: '',
            [field]: value,
            opError: 'Select any operator'
          }
        } else if (field === 'operator' && value !== '') {
          return {
            ...item,
            value: '',
            [field]: value,
            opError: ''
          }
        } else {
          return { ...item, [field]: value }
        }
      }
      return item
    })
    setConditions(newData)
    actions[0]?.id && setDeleteAction(actions)
    setActions([
      {
        id: 1,
        value: '',
        subject: '',
        status: 'CREATED',
        operator: 'set',
        field: ''
      }
    ])
  }

  const onSubjectBlur = (rule) => {
    const newData = conditions.map((item) => {
      if (item.id === rule?.id) {
        if (rule?.subject === '') {
          return { ...item, subError: 'Select any subject' }
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
          return { ...item, opError: 'Select any operator' }
        } else {
          return { ...item, opError: '' }
        }
      }
      return item
    })
    setConditions(newData)
  }

  const onDeleteCondtion = (rule) => {
    setError('')
    const newData = conditions?.filter((item) => item.id !== rule?.id)
    setConditions(newData)
    if (rule?.status === 'ADDED') {
      setDeletedCondition((prev) => [...prev, rule])
    }
  }

  const SingleValue = ({ data, ...props }) => {
    return (
      <components.SingleValue {...props}>
        <Flex display='flex' alignItems='center' gap={'7px'}>
          <SubjectIcon subject={data?.value} isSystem={isSystem} />
          <Text>{data.label}</Text>
        </Flex>
      </components.SingleValue>
    )
  }

  const subjectOptions = [
    {
      label: '',
      options: [{ value: '', label: '-- Subject --' }]
    },
    ...categories.map((category) => ({
      label: category,
      options: automationConditionSubjectFieldMapping
        .filter((item) => item.subject === category)
        .map((item) => ({
          value: optionsByCategory[category]?.find(
            (opt) => opt.props.children === item.name
          ).props.value,
          label: item.name
        }))
    }))
  ]

  const booleanSelectOptions = [
    { label: '-- Select --', value: '' },
    { label: 'Yes', value: 'true' },
    { label: 'No', value: 'false' }
  ]

  return (
    <>
      {conditions?.length > 0 &&
        conditions?.map((item, index) => (
          <Box key={index}>
            <Flex
              key={index}
              sx={{ w: '100%', gap: 2, mt: 1.5, alignItems: 'flex-start' }}
            >
              {/* SUBJECT */}
              <FormControl isInvalid={item?.subError !== ''}>
                <LynkSelect
                  isDisabled={isSystem}
                  onChange={(selected) =>
                    onCondtionChange(selected?.value, item?.id, 'subject')
                  }
                  onBlur={() => onSubjectBlur(item)}
                  placeholder='-- Subject --'
                  id={`auto_conditon_subject_${index}`}
                  options={
                    conditions.length > 1 &&
                    !(
                      conditions[0]?.subject === '' &&
                      conditions[1]?.subject === ''
                    )
                      ? subjectOptions.filter(
                          (item, index) =>
                            index === 0 ||
                            item.label === conditions[0]?.category
                        )
                      : subjectOptions
                  }
                  components={{ SingleValue }}
                  dropDown
                />

                <FormErrorMessage>{item?.subError}</FormErrorMessage>
              </FormControl>
              {/* OPERATOR */}
              <FormControl isInvalid={item?.opError !== ''}>
                <LynkSelect
                  name='operator'
                  onChange={(selected) =>
                    onCondtionChange(selected?.value, item.id, 'operator')
                  }
                  value={
                    [
                      { label: '-- Operator --', value: '' },
                      ...(item?.list ?? []).map((option) => ({
                        label: updatedValue(option),
                        value: option
                      }))
                    ].find((option) => option.value === item?.operator) || null
                  }
                  placeholder='-- Operator --'
                  onBlur={() => onOperatorBlur(item)}
                  isDisabled={isSystem}
                  id={`auto_conditon_operator_${index}`}
                  options={[
                    { label: '-- Operator --', value: '' },
                    ...(item?.list ?? []).map((option) => ({
                      label: updatedValue(option),
                      value: option
                    }))
                  ]}
                  styles={{ container: (base) => ({ ...base, minWidth: 160 }) }}
                  dropDown
                />
                <FormErrorMessage>{item?.opError}</FormErrorMessage>
              </FormControl>
              {/* VALUE */}
              {item?.operator !== 'exists' &&
                item?.operator !== 'not_exists' &&
                item?.operator !== 'boolean_is' && (
                  <Input
                    type={'text'}
                    placeholder='Value'
                    value={item?.value}
                    onChange={(e) =>
                      onCondtionChange(e.target.value, item.id, 'value')
                    }
                    sx={{ fontSize: 'sm' }}
                  />
                )}
              {item?.operator === 'boolean_is' && (
                <LynkSelect
                  type='text'
                  onChange={(selected) =>
                    onCondtionChange(selected?.value, item.id, 'value')
                  }
                  value={booleanSelectOptions.find(
                    (option) => option.value === item?.value
                  )}
                  styles={{ container: (base) => ({ ...base, minWidth: 140 }) }}
                  placeholder='-- Select --'
                  options={booleanSelectOptions}
                  dropDown
                />
              )}
              <Flex gap={4} justifyContent={'space-between'}>
                {conditions?.length > 1 && (
                  <IconButton
                    border='1px solid'
                    colorScheme='white'
                    borderColor={grayBorderColor}
                    aria-label='Remove condition'
                    onClick={() => onDeleteCondtion(item)}
                    icon={
                      <Icon
                        color={primaryErrorColor}
                        w={6}
                        h={6}
                        as={MdDeleteOutline}
                      />
                    }
                  />
                )}
              </Flex>
            </Flex>
            {conditions?.length > 1 && conditions?.length - 1 !== index && (
              <Tag mt={1.5}>
                <Text fontSize={10} fontWeight={600}>
                  AND
                </Text>
              </Tag>
            )}
          </Box>
        ))}
    </>
  )
}

export default RuleConditions
