import React from 'react'

import { CustomSelect } from './Select'

const getVersionOptions = (filters) => {
  const selectedEnv = filters.env?.value
  if (selectedEnv === undefined) {
    return
  }
  const optionsFinal = filters?.product?.reduce((options, singleProduct) => {
    const selectedProject = singleProduct.projects?.find(
      (project) => project.name == selectedEnv
    )

    const optionsInternal = selectedProject.sbomVersions.nodes.reduce(
      (acc, version) => {
        return [
          ...acc,
          {
            label: version.projectVersion,
            value: version.id
          }
        ]
      },
      []
    )

    return [...options, ...optionsInternal]
  }, [])

  return optionsFinal
}

export const VersionSelect = ({ value, onChange, filters }) => {
  const options = getVersionOptions(filters)

  return (
    <CustomSelect
      isMulti
      isDisabled={!filters?.product?.length || filters.env?.value === undefined}
      label='Version'
      options={options}
      value={value}
      onChange={onChange}
    />
  )
}
