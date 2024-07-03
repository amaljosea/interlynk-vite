import { useGlobalState } from 'hooks/useGlobalState'

export const useHasPermission = ({ parentKey, childKey }) => {
  const { userPermissions } = useGlobalState()

  const parentPermission = userPermissions?.find(
    (item) => item.key === parentKey
  )
  const hasPermission = parentPermission?.supersededBy?.some(
    (permission) => permission.key === childKey && permission.value === true
  )

  return hasPermission
}
