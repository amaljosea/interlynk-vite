import { Spinner } from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'

import EnvironmentButtons from './EnvironmentButtons'

const EnvGeneralFilter = (props) => {
  const { reset, totalCounts } = props

  const { dispatch, envName, setEnvName } = useGlobalState()

  const variant = (env) => (envName === env ? 'solid' : 'ghost')
  const colorScheme = (env) => (envName === env ? 'blue' : 'gray')

  const { globalVulnDispatch } = dispatch

  const handleButtonClick = (value) => {
    setEnvName(value)
    globalVulnDispatch({ type: 'FILTER_ENV', payload: [value] })
    reset()
  }

  const {
    defaultTotalCount,
    developmentTotalCount,
    productionTotalCount,
    totalsLoading
  } = totalCounts

  const renderCount = (count) => (totalsLoading ? <Spinner size='xs' /> : count)

  return (
    <EnvironmentButtons
      isGeneralFilter={true}
      getDefaultCount={renderCount(defaultTotalCount)}
      getDevelopmentCount={renderCount(developmentTotalCount)}
      getProductionCount={renderCount(productionTotalCount)}
      variant={variant}
      colorScheme={colorScheme}
      onClick={handleButtonClick}
    />
  )
}

export default EnvGeneralFilter
