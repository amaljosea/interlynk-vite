import { useGlobalState } from 'hooks/useGlobalState'

import { CustomSelect } from './Select'

const getVersionOptions = (filters, env) => {
  const { product } = filters || {}

  const optionsFinal = product?.reduce((options, singleProduct) => {
    const selectedProject = singleProduct?.projects?.find(
      (project) => project?.label === env && project
    )

    const optionsInternal = selectedProject?.versions
      ?.filter((item) => item?.lifecycle !== 'draft')
      ?.reduce((acc, version) => {
        return [...acc, { label: version?.label, value: version?.value }]
      }, [])

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
