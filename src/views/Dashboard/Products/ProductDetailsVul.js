import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

import { Flex, Skeleton } from '@chakra-ui/react'

import Card from 'components/Card/Card'

import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'

import { GetGlobalVulnData } from 'graphQL/Queries'

import VulnInfo from '../Vulnerabilities/vulnInfo'

const ProductDetailsVul = () => {
  const params = useParams()
  const productId = params.productid
  const productGroupId = params.productgroupid
  const vulnId = params.vulnerabilityid

  const { totalRows, compVulnState } = useGlobalState()
  const {
    searchInput: compVulnSearch,
    envs,
    statuses,
    versions: sbomVersions,
    vexComplete: isCompleted
  } = compVulnState

  const vulnsPermissions = useHasPermission({
    parentKey: 'view_feeds'
  })

  const {
    data: vulnInfo,
    refetch: getVulnData,
    loading
  } = useQuery(GetGlobalVulnData, {
    skip: vulnId && vulnsPermissions === true ? false : true,
    fetchPolicy: 'cache-and-network',
    variables: {
      id: vulnId,
      first: totalRows,
      projectIds: [productId],
      projectGroupIds: [productGroupId],
      search: compVulnSearch !== '' ? compVulnSearch : undefined,
      projectNames: envs?.length === 0 ? undefined : envs,
      versions: sbomVersions?.length === 0 ? undefined : sbomVersions,
      statuses: statuses?.length === 0 ? undefined : statuses,
      vexComplete: isCompleted === true ? true : undefined
    }
  })

  if (loading) {
    return (
      <Card>
        <Flex width={'100%'} gap={4} direction={'row'}>
          <Skeleton width={'100%'} height='30px' />
          <Skeleton width={'100%'} height='30px' />
        </Flex>
      </Card>
    )
  }

  if (vulnId) {
    return (
      <VulnInfo
        data={vulnInfo?.vuln}
        componentVulns={vulnInfo?.componentVulns}
        refetch={getVulnData}
      />
    )
  }
}

export default ProductDetailsVul
