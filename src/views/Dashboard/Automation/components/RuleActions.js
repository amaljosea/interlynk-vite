import { Box, Flex, FormControl, Select, Tag, Text } from '@chakra-ui/react'
import { Input, InputGroup, InputLeftElement } from '@chakra-ui/react'
import { Icon, IconButton } from '@chakra-ui/react'

import LynkDate from 'components/LynkDate'

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
  setDeleteAction
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

  return (
    <>
      {actions?.length > 0 &&
        actions?.map((item, index) => (
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
                <FormControl as={Flex} alignItems='center'>
                  <Select
                    value={item?.field}
                    onChange={(e) =>
                      onActionChange(e.target.value, item.id, 'field')
                    }
                    placeholder='-- Subject --'
                    textTransform={'capitalize'}
                    isDisabled={
                      conditionErrorMessage ||
                      conditions?.length === 0 ||
                      isSystem
                    }
                    sx={{ paddingLeft: '34px', fontSize: 'sm' }}
                    data-testid={`auto_action_subject_${index}`}
                  >
                    {conditions?.some((item) => item?.category === 'component')
                      ? [...categories]
                          ?.filter((item) => item !== 'version')
                          .map((category) => (
                            <optgroup key={category} label={category}>
                              {optionsByCategory[category]}
                            </optgroup>
                          ))
                      : [...categories]
                          ?.filter((item) => item !== 'component')
                          .map((category) => (
                            <optgroup key={category} label={category}>
                              {optionsByCategory[category]}
                            </optgroup>
                          ))}
                  </Select>
                </FormControl>
              </InputGroup>
              {/* OPERATOR */}
              <Input
                textTransform={'capitalize'}
                defaultValue={item?.operator}
                isDisabled={
                  conditionErrorMessage || conditions?.length === 0 || isSystem
                }
                sx={{ w: '130px', fontSize: 'sm', pointerEvents: 'none' }}
              />
              {/* VALUE */}
              {item?.field === 'component_internal' ? (
                <Select
                  type={'text'}
                  value={item?.value}
                  onChange={(e) =>
                    onActionChange(e.target.value, item.id, 'value')
                  }
                  sx={{ minW: 140, fontSize: 'sm' }}
                >
                  <option value=''>-- Select --</option>
                  <option value={'true'}>Yes</option>
                  <option value={'false'}>No</option>
                </Select>
              ) : item?.field === 'component_support_level' ? (
                <Select
                  type={'text'}
                  value={item?.value}
                  onChange={(e) =>
                    onActionChange(e.target.value, item.id, 'value')
                  }
                  sx={{ minW: 140, fontSize: 'sm' }}
                >
                  <option value=''>-- Select --</option>
                  <option value='UNSPECIFIED'>Unspecified</option>
                  <option value='ACTIVELY_MAINTAINED'>
                    Actively Maintained
                  </option>
                  <option value='NO_LONGER_MAINTAINED'>
                    No Longer Maintained
                  </option>
                  <option value='ABANDONED'>Abandoned</option>
                </Select>
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
                    {actions?.length > 1 && (
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
