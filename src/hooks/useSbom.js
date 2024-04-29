import { useQuery } from '@apollo/client'

import { GetSbomName } from 'graphQL/Queries'

export const useSbom = ({ projectId, sbomId }) => {
  const { data } = useQuery(GetSbomName, {
    skip: !sbomId || !projectId,
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
