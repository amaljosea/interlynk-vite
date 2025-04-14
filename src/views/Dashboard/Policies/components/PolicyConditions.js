import { Box, Flex, Tag, TagLabel } from '@chakra-ui/react'

import Operator from './Operator'
import Subject from './Subject'
import Value from './Value'

const PolicyConditions = ({
  conditions,
  setConditions,
  setError,
  setDeletedRules,
  plSubjects,
  formData
}) => {
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
            operator: '', // Reset operator when subject is changed
            value: '', // Reset value when subject is changed
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
            opError: '',
            value: '',
            min: '0',
            max: '0'
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

  return (
    <>
      {conditions?.length > 0 &&
        conditions?.map((item, index) => (
          <Box key={index}>
            <Flex gap={2} mt={1.5} alignItems={'flex-start'}>
              {/* SUBJECT */}
              <Subject index={index} data={item} onChange={onChangeRule} />
              {/* OPERATOR */}
              <Operator index={index} data={item} onChange={onChangeRule} />
              {/* VALUE */}
              <Value
                data={item}
                index={index}
                setError={setError}
                conditions={conditions}
                onChange={onChangeRule}
                setConditions={setConditions}
                setDeletedRules={setDeletedRules}
              />
            </Flex>
            {conditions?.length > 1 && conditions?.length - 1 !== index && (
              <Tag mt={1.5} p={1}>
                <TagLabel fontSize={10} fontWeight={600}>
                  {formData?.operator === 'ALL' ? 'AND' : 'OR'}
                </TagLabel>
              </Tag>
            )}
          </Box>
        ))}
    </>
  )
}

export default PolicyConditions
