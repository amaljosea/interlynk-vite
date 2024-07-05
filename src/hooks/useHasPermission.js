import { useGlobalState } from 'hooks/useGlobalState'

export const useHasPermission = ({ parentKey, childKey = null }) => {
  const { userPermissions } = useGlobalState()

  const parentPermission = userPermissions?.find(
    (item) => item.key === parentKey
  )

  if (childKey) {
    const hasChildPermission = parentPermission?.supersededBy?.some(
      (permission) => permission.key === childKey && permission.value === true
    )
    return hasChildPermission
  }

  return parentPermission?.value === true
}
