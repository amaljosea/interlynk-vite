import { gql, useLazyQuery } from '@apollo/client'
import { useEffect, useState } from 'react'

import { useGlobalState } from 'hooks/useGlobalState'

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

export const ProductSelect = ({ value, onChange }) => {
  const { orgView, analyticsState } = useGlobalState()
  const { label } = analyticsState || {}

  const [options, setOptions] = useState([])

  const [getProducts, { loading }] = useLazyQuery(PRODUCT_OPTION_QUERY, {
    skip: !orgView,
    variables: { labelIds: label ? [label?.value] : undefined }
  })

  useEffect(() => {
    const labelIds = label?.value ? [label.value] : []
    getProducts({ variables: { labelIds } }).then((res) => {
      const nodes = res?.data?.organization?.projectGroups?.nodes
      if (!nodes) return

      const newOptions = nodes?.map((item) => ({
        label: item?.label,
        value: item?.value,
        projects: item?.projects?.map((project) => ({
          label: project?.name,
          value: project?.id,
          versions: project?.sbomVersions?.nodes?.map((version) => ({
            label: version?.projectVersion,
            value: version?.id
          }))
        }))
      }))
      setOptions(newOptions)
    })
  }, [getProducts, label])

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
