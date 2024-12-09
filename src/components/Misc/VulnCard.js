import { gql, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

import { Flex, IconButton, SimpleGrid, Stack, Text } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import LynkModal from 'components/LynkModal'

import { useThemeColor } from 'hooks/useThemeColors'

import { FaBug, FaCircleInfo } from 'react-icons/fa6'

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

  const { primaryBlueText, sameSecondaryText, infoTextColor } = useThemeColor([
    'primaryBlueText',
    'sameSecondaryText',
    'infoTextColor'
  ])

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

  const label = { fontSize: 12, color: sameSecondaryText }
  const infoStyle = {
    fontSize: 14,
    fontWeight: 600,
    color: infoTextColor
  }

  const vulnData = [
    { label: 'Source', value: source || 'N/A' },
    { label: 'CVSS Score', value: cvssScore || 'N/A' },
    { label: 'EPSS', value: epssScores || 'N/A' },
    { label: 'KEV', value: kev ? 'Yes' : 'No' }
  ]

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
        <Stack spacing={6}>
          <Flex alignItems={'center'} gap={3}>
            <IconButton size='sm' colorScheme='blue' icon={<FaBug />} />
            <Text fontSize={17} color={primaryBlueText} fontWeight={600}>
              {vulnId}
            </Text>
          </Flex>
          <SimpleGrid columns={2} gap={5}>
            {vulnData?.map((item, index) => (
              <Stack key={index} spacing={1}>
                <Text {...label}>{item?.label}</Text>
                <Text {...infoStyle}>{item?.value}</Text>
              </Stack>
            ))}
          </SimpleGrid>
        </Stack>
      )}
    </LynkModal>
  )
}

export default VulnCard
