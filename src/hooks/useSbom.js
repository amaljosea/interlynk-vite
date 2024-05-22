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

  return {
    versionName: signedUrlParams
      ? data?.shareLynkQuery?.sbom?.projectVersion
      : data?.sbom?.projectVersion,
    projectGroupName: signedUrlParams
      ? data?.shareLynkQuery?.sbom?.project?.projectGroup?.name
      : data?.sbom?.project?.projectGroup?.name
  }
}
