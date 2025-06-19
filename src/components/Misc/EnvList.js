import { useParams } from 'react-router-dom'

import { useGlobalState } from 'hooks/useGlobalState'

import EnvironmentButtons from './EnvironmentButtons'

const EnvList = ({ data }) => {
  const params = useParams()
  const productId = params.productid
  const { projects } = data || {}

  const { onChangeEnv, onClearSelection, dispatch } = useGlobalState()

  const { prodDispatch } = dispatch

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
  }

  const getCountByLifestage = (name) => {
    const project = projects?.find((item) => item.name === name)
    return project ? project.sbomsCount : 0
  }

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
