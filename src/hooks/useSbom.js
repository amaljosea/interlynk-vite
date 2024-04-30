import { useQuery } from '@apollo/client'

import { GetSbomName } from 'graphQL/Queries'

export const useSbom = ({ projectId, sbomId }) => {
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')

  const { data } = useQuery(GetSbomName, {
    skip: !sbomId || !projectId || signedUrlParams,
    variables: {
      sbomId,
      projectId
    }
  })

  return {
    versionName: data?.sbom?.projectVersion,
    projectGroupName: data?.sbom?.project?.projectGroup?.name
  }
}
