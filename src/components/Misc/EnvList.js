import { useParams } from 'react-router-dom'

import { useGlobalState } from 'hooks/useGlobalState'
import useQueryParam from 'hooks/useQueryParam'

import EnvironmentButtons from './EnvironmentButtons'

const EnvList = ({ data }) => {
  const params = useParams()
  const productId = params.productid
  const { projects } = data || {}
  const filter = useQueryParam('lifestage')

  const { onChangeEnv, onClearSelection, dispatch } = useGlobalState()

  const { prodDispatch, versionDispatch } = dispatch

  const activeEnv = projects?.find((item) => item?.id === params?.productid)
  const { name } = activeEnv || ''

  const handleClick = (value) => {
    const env = projects?.find((item) => item.name === value)
    onClearSelection()
    onChangeEnv(env?.name)
    prodDispatch({
      type: 'SET_CURRENT_PRODUCT',
      payload: { id: env?.id }
    })
    if (filter) {
      versionDispatch({ type: 'FILTER_LIFESTAGE', payload: [filter] })
    } else {
      versionDispatch({ type: 'FILTER_LIFESTAGE', payload: [] })
    }
  }

  const getProjectSbomsCount = (name) => {
    const project = projects?.find((item) => item.name === name)
    return project ? project.sbomsCount : 0
  }

  const getVersionsByLifestage = (name) => {
    const filterProjects = projects?.find((item) => item.name === name)
    const filteredSboms = filterProjects?.sboms?.filter(
      (item) => item?.productLifeCycleStage === filter
    )
    return filteredSboms?.length > 0 ? filteredSboms?.length : 0
  }

  const getCountByLifestage = filter
    ? getVersionsByLifestage
    : getProjectSbomsCount
  const defaultCount = getCountByLifestage('default')
  const devCount = getCountByLifestage('development')
  const prodCount = getCountByLifestage('production')

  const variant = (env) =>
    name === env ? 'solid' : productId ? 'ghost' : 'outline'
  const colorScheme = (env) =>
    name === env ? 'blue' : productId ? 'gray' : 'blue'

  return (
    <EnvironmentButtons
      isGeneralFilter={false}
      getDefaultCount={defaultCount}
      getDevelopmentCount={devCount}
      getProductionCount={prodCount}
      data={data}
      variant={variant}
      colorScheme={colorScheme}
      onClick={handleClick}
    />
  )
}

export default EnvList
