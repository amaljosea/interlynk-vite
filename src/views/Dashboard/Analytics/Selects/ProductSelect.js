import { gql, useQuery } from '@apollo/client'
import React from 'react'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'

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
  const { orgView } = useGlobalQueryContext()
  const { data, loading, error } = useQuery(PRODUCT_OPTION_QUERY, {
    skip: !orgView
  })

  if (error) {
    return 'Error'
  }

  const options = data?.organization?.projectGroups?.nodes || []
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
