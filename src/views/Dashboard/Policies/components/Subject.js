import { useQuery } from '@apollo/client'
import { getIcon } from 'utils/styleUtils'

import { Icon, Select } from '@chakra-ui/react'
import { FormControl, FormErrorMessage } from '@chakra-ui/react'
import { InputGroup, InputLeftElement } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { PolicySubjectOperators } from 'graphQL/Queries'

const Subject = ({ index, data, onChange }) => {
  const { id, subject, subError } = data || {}

  const { primaryBlueText } = useThemeColor(['primaryBlueText'])

  const { data: subOperators, loading } = useQuery(PolicySubjectOperators)
  const { policySubjectOperatorMapping } = subOperators || []

  const sortedData =
    policySubjectOperatorMapping?.length > 0
      ? policySubjectOperatorMapping
          .slice()
          .sort((a, b) => a?.subject?.localeCompare(b?.subject))
      : []

  const categories = [...new Set(sortedData?.map((item) => item.category))]

  const optionsByCategory = categories.reduce((acc, category) => {
    const options = policySubjectOperatorMapping
      ?.filter((item) => item.category === category)
      ?.map((item, index) => (
        <option
          key={index}
          value={item.subject}
          style={{ textTransform: 'capitalize' }}
        >
          {item.name}
        </option>
      ))
    acc[category] = options
    return acc
  }, {})

  return (
    <FormControl isInvalid={subError}>
      <InputGroup>
        <InputLeftElement pointerEvents='none'>
          <Icon color={primaryBlueText} as={getIcon(subject)} />
        </InputLeftElement>
        <Select
          fontSize='sm'
          value={subject}
          sx={{ paddingLeft: '34px' }}
          placeholder={loading ? 'Loading...' : '-- select --'}
          data-testid={`condition_subject_${index}`}
          onChange={(e) => onChange(e.target.value, id, 'subject')}
        >
          {categories.map((category) => (
            <optgroup key={category} label={category}>
              {optionsByCategory[category]}
            </optgroup>
          ))}
        </Select>
      </InputGroup>
      <FormErrorMessage>{subError}</FormErrorMessage>
    </FormControl>
  )
}

export default Subject
