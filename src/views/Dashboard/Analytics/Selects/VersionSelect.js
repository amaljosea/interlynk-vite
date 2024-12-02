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

export const VersionSelect = ({ env, value, onChange, filters }) => {
  const options = getVersionOptions(filters, env)

  return (
    <CustomSelect
      isMulti
      isDisabled={!filters?.product?.length}
      label='Version'
      options={options}
      value={value}
      onChange={onChange}
    />
  )
}
