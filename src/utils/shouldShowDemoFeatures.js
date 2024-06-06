/* eslint-disable no-unreachable */
const IS_DEMO_ENABLED = true
const DEMO_ORG_NAME = 'Interlynk - Demo'

export const shouldShowDemoFeatures = () => {
  const orgName = localStorage.getItem('organization')
  return IS_DEMO_ENABLED && orgName === DEMO_ORG_NAME
}
