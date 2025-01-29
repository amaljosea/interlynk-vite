import { useEffect, useState } from 'react'

import { Spinner } from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'

import EnvironmentButtons from './EnvironmentButtons'

const EnvGeneralFilter = (props) => {
  const { reset, totalCounts } = props
  const [name, setName] = useState('')

  const { dispatch, globalVulnState } = useGlobalState()

  const variant = (env) => (name === env ? 'solid' : 'ghost')
  const colorScheme = (env) => (name === env ? 'blue' : 'gray')

  const { globalVulnDispatch } = dispatch

  const handleButtonClick = (value) => {
    setName(value)
    globalVulnDispatch({ type: 'FILTER_ENV', payload: value })
    reset()
  }

  useEffect(() => {
    if (globalVulnState?.projectNames.length === 0) {
      setName('default')
    } else {
      setName(globalVulnState?.projectNames)
    }
  }, [globalVulnState?.projectNames, name])

  const {
    defaultTotalCount = 0,
    developmentTotalCount = 0,
    productionTotalCount = 0,
    totalsLoading
  } = totalCounts

  const defaultEnvs = totalsLoading ? <Spinner size='xs' /> : defaultTotalCount
  const developmentEnvs = totalsLoading ? (
    <Spinner size='xs' />
  ) : (
    developmentTotalCount
  )
  const productionEnvs = totalsLoading ? (
    <Spinner size='xs' />
  ) : (
    productionTotalCount
  )

  return (
    <EnvironmentButtons
      isGeneralFilter={true}
      getDefaultCount={defaultEnvs}
      getDevelopmentCount={developmentEnvs}
      getProductionCount={productionEnvs}
      variant={variant}
      colorScheme={colorScheme}
      onClick={handleButtonClick}
    />
  )
}

export default EnvGeneralFilter
