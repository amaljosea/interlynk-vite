import { useQuery } from '@apollo/client'
import { components } from 'react-select'
import { getIcon } from 'utils/styleUtils'

import { Flex, Icon } from '@chakra-ui/react'
import { FormControl, FormErrorMessage } from '@chakra-ui/react'

import LynkSelect from 'components/LynkSelect'

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

  const SingleValue = ({ data, ...props }) => (
    <components.SingleValue {...props}>
      <Flex display='flex' alignItems='center'>
        <Icon
          color={primaryBlueText}
          as={getIcon(data.value)}
          style={{
            fontSize: 18,
            marginRight: '6px'
          }}
        />
        {data.label}
      </Flex>
    </components.SingleValue>
  )

  const options = [
    {
      label: '',
      options: [{ value: '', label: '-- Select --' }]
    },
    ...categories.flatMap((category) => ({
      label: category,
      options: policySubjectOperatorMapping
        .filter((item) => item.category === category)
        .map((item) => ({
          value: item.subject,
          label: item.name
        }))
    }))
  ]

  const selectStyles = {
    container: (baseStyles) => ({
      ...baseStyles,
      minWidth: '100px'
    })
  }

  return (
    <FormControl isInvalid={subError}>
      <LynkSelect
        value={options
          .flatMap((group) => group.options)
          .find((opt) => opt.value === subject)}
        onChange={(option) => onChange(option?.value || '', id, 'subject')}
        options={options}
        placeholder={loading ? 'Loading...' : '-- Select --'}
        dropDown
        components={{ SingleValue }}
        id={`condition_subject_${index}`}
        styles={selectStyles}
      />

      <FormErrorMessage>{subError}</FormErrorMessage>
    </FormControl>
  )
}

export default Subject
