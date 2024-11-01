import { updatedValue } from 'utils'

import {
  Box,
  Flex,
  FormControl,
  FormErrorMessage,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Tag,
  Text
} from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { MdDeleteOutline } from 'react-icons/md'

import SubjectIcon from './SubjectIcon'

const RuleConditions = ({
  conditions,
  setConditions,
  isSystem,
  setError,
  automationConditionSubjectFieldMapping,
  categories,
  optionsByCategory,
  setDeletedCondition
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
            [field]: value,
            subError: 'Select any subject'
          }
        } else if (field === 'subject' && value !== '') {
          const result = automationConditionSubjectFieldMapping?.find(
            (item) => item?.key === value
          )
          return {
            ...item,
            [field]: value,
            subError: '',
            category: result?.subject,
            list: result?.operators
          }
        } else if (field === 'operator' && value === '') {
          return {
            ...item,
            [field]: value,
            opError: 'Select any operator'
          }
        } else if (field === 'operator' && value !== '') {
          return {
            ...item,
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

  return (
    <>
      {conditions?.length > 0 &&
        conditions?.map((item, index) => (
          <Box key={index}>
            <Flex
              key={index}
              justifyContent={'space-bewteen'}
              sx={{ w: '100%', gap: 2, mt: 1.5, alignItems: 'flex-start' }}
            >
              {/* ICON */}
              <InputGroup>
                <InputLeftElement pointerEvents='none'>
                  <SubjectIcon subject={item?.subject} isSystem={isSystem} />
                </InputLeftElement>
                {/* SUBJECT */}
                <FormControl isInvalid={item?.subError !== ''}>
                  <Select
                    isDisabled={isSystem}
                    value={item?.subject}
                    onChange={(e) =>
                      onCondtionChange(e.target.value, item.id, 'subject')
                    }
                    onBlur={() => onSubjectBlur(item)}
                    placeholder='-- Subject --'
                    onBlurCapture={() => onSubjectBlur(item)}
                    textTransform={'capitalize'}
                    sx={{ paddingLeft: '34px', fontSize: 'sm' }}
                    data-testid={`auto_conditon_subject_${index}`}
                  >
                    {conditions?.length > 1 &&
                    conditions?.some((item) => item?.category === 'component')
                      ? [...categories]
                          ?.filter((item) => item !== 'version')
                          .map((category) => (
                            <optgroup key={category} label={category}>
                              {optionsByCategory[category]}
                            </optgroup>
                          ))
                      : conditions?.length > 1 &&
                          conditions?.some(
                            (item) => item?.category === 'version'
                          )
                        ? [...categories]
                            ?.filter((item) => item !== 'component')
                            .map((category) => (
                              <optgroup key={category} label={category}>
                                {optionsByCategory[category]}
                              </optgroup>
                            ))
                        : categories.map((category) => (
                            <optgroup key={category} label={category}>
                              {optionsByCategory[category]}
                            </optgroup>
                          ))}
                  </Select>
                  <FormErrorMessage>{item?.subError}</FormErrorMessage>
                </FormControl>
              </InputGroup>
              {/* OPERATOR */}
              <FormControl isInvalid={item?.opError !== ''}>
                <Select
                  id='operator'
                  name='operator'
                  value={item?.operator}
                  onChange={(e) =>
                    onCondtionChange(e.target.value, item.id, 'operator')
                  }
                  fontSize='sm'
                  placeholder='-- Operator --'
                  onBlur={() => onOperatorBlur(item)}
                  isDisabled={isSystem}
                  data-testid={`auto_conditon_operator_${index}`}
                >
                  {item?.list?.map((option) => (
                    <option value={option} key={option}>
                      {updatedValue(option)}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{item?.opError}</FormErrorMessage>
              </FormControl>
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
                    sx={{ minW: 140, fontSize: 'sm' }}
                  />
                )}
              {item?.operator === 'boolean_is' && (
                <Select
                  type={'text'}
                  value={item?.value}
                  onChange={(e) =>
                    onCondtionChange(e.target.value, item.id, 'value')
                  }
                  sx={{ minW: 140, fontSize: 'sm' }}
                >
                  <option value=''>-- Select --</option>
                  <option value={'true'}>Yes</option>
                  <option value={'false'}>No</option>
                </Select>
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
