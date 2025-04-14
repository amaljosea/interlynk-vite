import { useGlobalState } from 'hooks/useGlobalState'

import { CustomSelect } from './Select'

const getVersionOptions = (filters, env) => {
  const optionsFinal = filters?.product?.reduce((options, singleProduct) => {
    const selectedProject = singleProduct.projects?.find(
      (project) => project.name === env
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

export const VersionSelect = ({ value, onChange }) => {
  const { envName, analyticsState } = useGlobalState()
  const { product } = analyticsState || {}

  const options = getVersionOptions(analyticsState, envName)

  return (
    <CustomSelect
      isMulti
      isDisabled={!product?.length}
      label='Version'
      options={options}
      value={value}
      onChange={onChange}
    />
  )
}
