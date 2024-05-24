import { useQuery } from '@apollo/client'

import { GetSbomName, GetSharedSbomData } from 'graphQL/Queries'

export const useSbom = ({ projectId, sbomId }) => {
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')

  const { data } = useQuery(signedUrlParams ? GetSharedSbomData : GetSbomName, {
    skip: sbomId ? false : true,
    variables: {
      sbomId,
      projectId: signedUrlParams ? undefined : projectId
    }
  })

  const getVersionName = () => {
    if (signedUrlParams) {
      return (
        data?.shareLynkQuery?.sbom?.primaryComponent?.version ||
        data?.shareLynkQuery?.sbom?.projectVersion
      )
    } else {
      const primaryComponent = data?.sbom?.primaryComponent

      if (primaryComponent) {
        return `${primaryComponent.name} ${primaryComponent.version ? ':' : ''} ${data?.sbom?.projectVersion}`
      }

      return data?.sbom?.projectVersion
    }
  }

  return {
    versionName: getVersionName(),
    projectGroupName: signedUrlParams
      ? data?.shareLynkQuery?.sbom?.project?.projectGroup?.name
      : data?.sbom?.project?.projectGroup?.name
  }
}
