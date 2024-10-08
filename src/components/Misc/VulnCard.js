import { gql, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

import { Divider, Grid, Stack, Text } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import LynkModal from 'components/LynkModal'

import { FaCircleInfo } from 'react-icons/fa6'

import CustomTag from './CustomTag'

export const GetVulnData = gql`
  query GetVulnData(
    $projectId: Uuid!
    $sbomId: Uuid!
    $search: String
    $orderBy: ComponentVulnOrderByInput
  ) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      vulns(sbomId: $sbomId, search: $search, orderBy: $orderBy) {
        totalCount
        nodes {
          vuln {
            id
            vulnId
            cvssScore
            source
            vulnInfo {
              epssScores
              kev
            }
          }
        }
      }
    }
  }
`

const VulnCard = ({ value, isOpen, onClose }) => {
  const params = useParams()

  const { data, loading } = useQuery(GetVulnData, {
    skip: isOpen ? false : true,
    variables: {
      projectId: params.productid,
      sbomId: params.sbomid,
      search: value,
      field: 'COMPONENT_VULNS_UPDATED_AT',
      direction: 'DESC'
    }
  })

  const { nodes } = data?.sbom?.vulns || ''
  const { vuln } = nodes?.length > 0 ? nodes[0] : ''
  const { vulnId, source, cvssScore, vulnInfo } = vuln || ''
  const { epssScores, kev } = vulnInfo || ''

  return (
    <LynkModal
      maxW={'500px'}
      isOpen={isOpen}
      onClose={onClose}
      title={'Vulnerability Details'}
      Icon={FaCircleInfo}
      noFooter
    >
      {loading ? (
        <CustomLoader />
      ) : (
        <Stack spacing={2} py={3}>
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>ID</Text>
            <CustomTag>{vulnId || '-'}</CustomTag>
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Source</Text>
            <CustomTag>{source || '-'}</CustomTag>
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>CVSS Score</Text>
            <CustomTag>{cvssScore || '-'}</CustomTag>
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>EPSS</Text>
            <CustomTag>{epssScores || '-'}</CustomTag>
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>KEV</Text>
            <CustomTag>{kev ? 'Yes' : 'No'}</CustomTag>
          </Grid>
        </Stack>
      )}
    </LynkModal>
  )
}

export default VulnCard
