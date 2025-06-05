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

  const primaryOptions = [
    {
      label: 'Primary Component',
      options: [
        {
          label: 'Primary Component License Expression',
          value: 'primary_component.license_exp'
        },
        { label: 'Primary Component PURL', value: 'primary_component.purl' },
        { label: 'Primary Component CPE', value: 'primary_component.cpe' },
        {
          label: 'Primary Component Supplier Organization Name',
          value: 'primary_component.supplier_name'
        },
        {
          label: 'Primary Component Supplier URL',
          value: 'primary_component.supplier_url'
        },
        {
          label: 'Primary Component Supplier Contact Name',
          value: 'primary_component.supplier_contact_name'
        },
        {
          label: 'Primary Component Supplier Contact Email',
          value: 'primary_component.supplier_contact_email'
        },
        { label: 'Primary Component Group', value: 'primary_component.group' },
        { label: 'Primary Component Name', value: 'primary_component.name' },
        {
          label: 'Primary Component Version',
          value: 'primary_component.version'
        },
        {
          label: 'Primary Component Support Level',
          value: 'primary_component.support_level'
        },
        {
          label: 'Primary Component End of Support',
          value: 'primary_component.end_of_support'
        },
        {
          label: 'Primary Component Internal',
          value: 'primary_component.internal'
        }
      ]
    }
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

  const formatGroupLabel = (data) => (
    <Flex justifyContent={'space-between'} alignItems={'center'}>
      <Text>Primary Component</Text>
      <Text>{data?.options?.length}</Text>
    </Flex>
  )

  const Option = (props) => {
    const { data } = props
    const result = data?.label?.replace('Primary Component', '').trim()
    return <components.Option {...props}>{result}</components.Option>
  }

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
                <FormControl
                  as={Flex}
                  alignItems='center'
                  gap={index !== 0 ? 2 : 0}
                >
                  {item?.operator === 'copy' ? (
                    <LynkSelect
                      type='text'
                      onChange={(selected) => {
                        onActionChange(selected?.value, item.id, 'value')
                      }}
                      placeholder='-- Select --'
                      options={primaryOptions}
                      value={
                        primaryOptions[0]?.options.find(
                          (option) => option.value === item?.value
                        ) || null
                      }
                      dropDown
                      components={{ Option }}
                      formatGroupLabel={formatGroupLabel}
                    />
                  ) : (
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
                  )}

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
