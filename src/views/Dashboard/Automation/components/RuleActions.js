import { components } from 'react-select'

import { Box, Flex, FormControl, Input, Tag, Text } from '@chakra-ui/react'

import DeleteButton from 'components/Icons/DeleteButton'
import LynkDate from 'components/LynkDate'
import LynkSelect from 'components/LynkSelect'

import SubjectIcon from './SubjectIcon'

const RuleActions = ({
  actions,
  setActions,
  conditions,
  // isSystem,
  setError,
  conditionErrorMessage,
  categories,
  optionsByCategory,
  setDeleteAction,
  automationConditionSubjectFieldMapping
}) => {
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
        } else if (field === 'operator') {
          return {
            ...item,
            [field]: value,
            value: value === 'set' ? '' : 'primary_component.version'
          }
        } else {
          return {
            ...item,
            [field]: value
          }
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
          <SubjectIcon subject={data?.value} isSystem={false} />
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

  const operatorsOptions = [
    { label: 'Copy', value: 'copy' },
    { label: 'Set', value: 'set' }
  ]

  return (
    <>
      {actions?.length > 0 &&
        actions?.map((item, index) => (
          <Box key={index}>
            <Flex
              key={index}
              flexWrap={'wrap'}
              sx={{ w: '100%', gap: 2, mt: 1.5, alignItems: 'flex-start' }}
            >
              {/* SUBJECT */}
              <FormControl>
                <LynkSelect
                  isDisabled={conditionErrorMessage || conditions?.length === 0}
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
              <LynkSelect
                type='text'
                onChange={(selected) =>
                  onActionChange(selected?.value, item.id, 'operator')
                }
                placeholder='-- Select --'
                options={operatorsOptions}
                value={
                  operatorsOptions.find(
                    (option) => option.value === item?.operator
                  ) || null
                }
                dropDown
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
                  onChange={(selected) => {
                    onActionChange(selected?.value, item.id, 'value')
                  }}
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
                    isReadOnly={item?.operator === 'copy'}
                    isDisabled={
                      conditionErrorMessage || conditions?.length === 0
                    }
                  />
                  <Flex gap={4} justifyContent={'space-between'}>
                    {index !== 0 && (
                      <DeleteButton
                        onClick={() => onDeleteAction(item)}
                        aria-label={'Remove action'}
                        display={
                          conditionErrorMessage || conditions?.length === 0
                            ? 'none'
                            : 'flex'
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
