import { gql, useQuery } from '@apollo/client'
import React from 'react'

import { CustomSelect } from './Select'

const PRODUCT_OPTION_QUERY = gql`
  query ProjectOptions {
    organization {
      id
      projectGroups {
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

export const ProductSelect = ({ value, onChange }) => {
  const { data, loading, error } = useQuery(PRODUCT_OPTION_QUERY)

  if (error) {
    return 'Error'
  }

  const options = data?.organization?.projectGroups?.nodes || []
  return (
    <CustomSelect
      isMulti
      isLoading={loading}
      label='Product'
      options={options}
      value={value}
      onChange={onChange}
    />
  )
}
