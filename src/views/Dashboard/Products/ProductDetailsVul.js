import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

import { Flex, Skeleton } from '@chakra-ui/react'

import Card from 'components/Card/Card'

import { useHasPermission } from 'hooks/useHasPermission'

import { GetGlobalVulnData } from 'graphQL/Queries'

import VulnInfo from '../Vulnerabilities/vulnInfo'

const ProductDetailsVul = () => {
  const params = useParams()
  const productId = params.productid
  const productGroupId = params.productgroupid
  const vulnId = params.vulnerabilityid

  const vulnsPermissions = useHasPermission({
    parentKey: 'view_feeds'
  })

  const { data: vulnInfo, loading } = useQuery(GetGlobalVulnData, {
    skip: vulnId && vulnsPermissions === true ? false : true,
    fetchPolicy: 'cache-and-network',
    variables: {
      id: vulnId,
      projectIds: [productId],
      projectGroupIds: [productGroupId]
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
      />
    )
  }
}

export default ProductDetailsVul
