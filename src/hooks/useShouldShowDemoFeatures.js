import { useGlobalState } from './useGlobalState'

const IS_DEMO_ENABLED = true
const DEMO_ORG_NAME = 'Interlynk - Demo'

export const useShouldShowDemoFeatures = () => {
  const { organization } = useGlobalState()
  const shouldShowDemoFeatures =
    IS_DEMO_ENABLED && organization?.name === DEMO_ORG_NAME

  return {
    shouldShowDemoFeatures
  }
}
