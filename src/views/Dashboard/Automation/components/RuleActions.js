import { components } from 'react-select'

import { Box, Flex, FormControl, Input, Tag, Text } from '@chakra-ui/react'
import { Icon, IconButton } from '@chakra-ui/react'

import LynkDate from 'components/LynkDate'
import LynkSelect from 'components/LynkSelect'

import { useThemeColor } from 'hooks/useThemeColors'

import { MdDeleteOutline } from 'react-icons/md'

import SubjectIcon from './SubjectIcon'

const RuleActions = ({
  actions,
  setActions,
  conditions,
  isSystem,
  setError,
  conditionErrorMessage,
  categories,
  optionsByCategory,
  setDeleteAction,
  automationConditionSubjectFieldMapping
}) => {
  const { grayBorderColor, primaryErrorColor } = useThemeColor([
    'grayBorderColor',
    'primaryErrorColor'
  ])
  const isComponent = conditions?.some((item) => item?.category === 'component')

  const onActionChange = (value, id, field) => {
    setError('')
    const newData = actions?.map((item) => {
      if (item.id === id) {
        if (field === 'field' && value !== '') {
          return {
            ...item,
            [field]: value,
            subject: isComponent ? 'component' : 'version'
          }
        } else {
          return { ...item, [field]: value }
        }
      }
      return item
    })
    setActions(newData)
  }

  const onDeleteAction = (action) => {
    setError('')
    const newData = actions?.filter((item) => item.id !== action?.id)
    setActions(newData)
    if (action?.status === 'ADDED') {
      setDeleteAction((prev) => [...prev, action])
    }
  }

  const handleDateChange = (newDate, id) => {
    const isValidDate = newDate && !isNaN(newDate)
    onActionChange(newDate?._d, id, 'value')
    if (isValidDate) {
      setError('')
    } else {
      setError('Invalid date')
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
    ...categories
      .filter((category) => category === conditions[0]?.category)
      .map((category) => ({
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

  const internalOptions = [
    { label: '-- Select --', value: '' },
    { label: 'Yes', value: 'true' },
    { label: 'No', value: 'false' }
  ]

  const supportOptions = [
    { label: '-- Select --', value: '' },
    { label: 'Unspecified', value: 'UNSPECIFIED' },
    {
      label: 'Actively Maintained',
      value: 'ACTIVELY_MAINTAINED'
    },
    {
      label: 'No Longer Maintained',
      value: 'NO_LONGER_MAINTAINED'
    },
    { label: 'Abandoned', value: 'ABANDONED' }
  ]

  return (
    <>
      {actions?.length > 0 &&
        actions?.map((item, index) => (
          <Box key={index}>
            <Flex
              key={index}
              sx={{ w: '100%', gap: 2, mt: 1.5, alignItems: 'flex-start' }}
            >
              {/* SUBJECT */}
              <FormControl>
                <LynkSelect
                  isDisabled={
                    conditionErrorMessage ||
                    conditions?.length === 0 ||
                    isSystem
                  }
                  onChange={(selected) =>
                    onActionChange(selected?.value, item?.id, 'field')
                  }
                  placeholder='-- Subject --'
                  id={`auto_action_subject_${index}`}
                  options={subjectOptions}
                  value={
                    subjectOptions[1]?.options.find(
                      (option) => option.value === item?.field
                    ) || null
                  }
                  components={{ SingleValue }}
                  dropDown
                />
              </FormControl>
              {/* OPERATOR */}
              <Input
                textTransform={'capitalize'}
                defaultValue={item?.operator}
                isDisabled={
                  conditionErrorMessage || conditions?.length === 0 || isSystem
                }
                sx={{ fontSize: 'sm', pointerEvents: 'none', w: 170 }}
              />
              {/* VALUE */}
              {item?.field === 'component_internal' ? (
                <LynkSelect
                  type='text'
                  onChange={(selected) =>
                    onActionChange(selected?.value, item.id, 'value')
                  }
                  placeholder='-- Select --'
                  options={internalOptions}
                  value={
                    internalOptions.find(
                      (option) => option.value === item?.value
                    ) || null
                  }
                  dropDown
                  styles={{
                    container: (base) => ({ ...base, width: 170 })
                  }}
                />
              ) : item?.field === 'component_support_level' ? (
                <LynkSelect
                  type='text'
                  onChange={(selected) =>
                    onActionChange(selected?.value, item.id, 'value')
                  }
                  placeholder='-- Select --'
                  options={supportOptions}
                  value={
                    supportOptions.find(
                      (option) => option.value === item?.value
                    ) || null
                  }
                  dropDown
                />
              ) : item?.field === 'component_end_of_support' ? (
                <LynkDate
                  name='endOfSupport'
                  value={item?.value ? new Date(item?.value) : ''}
                  onChange={(value) => handleDateChange(value, item?.id)}
                />
              ) : (
                <FormControl as={Flex} alignItems='center' gap={2}>
                  <Input
                    type={'text'}
                    placeholder={'Add value'}
                    value={item.value}
                    onChange={(e) =>
                      onActionChange(e.target.value, item.id, 'value')
                    }
                    isDisabled={
                      conditionErrorMessage ||
                      conditions?.length === 0 ||
                      isSystem
                    }
                    sx={{ minW: 140, fontSize: 'sm' }}
                  />
                  <Flex gap={4} justifyContent={'space-between'}>
                    {index !== 0 && (
                      <IconButton
                        border='1px solid'
                        colorScheme='white'
                        borderColor={grayBorderColor}
                        aria-label='Remove action'
                        onClick={() => onDeleteAction(item)}
                        display={
                          conditionErrorMessage || conditions?.length === 0
                            ? 'none'
                            : 'flex'
                        }
                        icon={
                          <Icon
                            as={MdDeleteOutline}
                            sx={{ w: 6, h: 6, color: primaryErrorColor }}
                          />
                        }
                      />
                    )}
                  </Flex>
                </FormControl>
              )}
            </Flex>
            {actions?.length > 1 && actions?.length - 1 !== index && (
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

export default RuleActions
