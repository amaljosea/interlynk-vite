import { gql, useQuery } from '@apollo/client'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'

import { CustomSelect } from './Select'

const PRODUCT_OPTION_QUERY = gql`
  query ProjectOptions($labelIds: [Uuid!]) {
    organization {
      id
      projectGroups(labelIds: $labelIds) {
        nodes {
          value: id
          label: name
          projects {
            id
            name
            sbomVersions {
              nodes {
                id
                projectVersion
              }
            }
          }
        }
      }
    }
  }
`

export const ProductSelect = ({ value, onChange, filters }) => {
  const { orgView } = useGlobalQueryContext()
  const { label } = filters

  const { data, loading, error } = useQuery(PRODUCT_OPTION_QUERY, {
    skip: !orgView,
    variables: { labelIds: label ? [label?.value] : undefined }
  })
  const options = data?.organization?.projectGroups?.nodes || []

  if (error) {
    return 'Error'
  }

  return (
    <CustomSelect
      isLoading={loading}
      label='Product'
      options={options}
      value={value}
      onChange={(newValue) => {
        onChange(newValue ? [newValue] : [])
      }}
    />
  )
}
