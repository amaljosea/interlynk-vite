import { gql, useQuery } from '@apollo/client'
import React from 'react'

import { CustomSelect } from './Select'

const PRODUCT_VERSION_OPTION_QUERY = gql`
  query ProjectVersionOptions($projectId: Uuid!) {
    project(id: $projectId) {
      id
      sbomVersions {
        nodes {
          value: id
          label: projectVersion
        }
      }
    }
  }
`

export const VersionSelect = ({ value, onChange, projectId }) => {
  const { data, loading, error } = useQuery(PRODUCT_VERSION_OPTION_QUERY, {
    variables: {
      projectId
    },
    skip: !projectId
  })

  if (error) {
    return 'Error'
  }

  const options = data?.project?.sbomVersions?.nodes || []
  return (
    <CustomSelect
      isDisabled={!projectId}
      isLoading={loading}
      label='Version'
      options={options}
      value={value}
      onChange={onChange}
    />
  )
}
