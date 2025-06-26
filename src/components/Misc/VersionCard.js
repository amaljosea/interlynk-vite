import { gql, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

import { Divider, Grid, Stack, Text } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import LynkModal from 'components/LynkModal'

import { useThemeColor } from 'hooks/useThemeColors'

import { GoVersions } from 'react-icons/go'

import CustomTag from './CustomTag'

export const GetProductVersionData = gql`
  query GetProductVersionData($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      primaryComponent {
        name
        version
      }
      project {
        projectGroup {
          name
        }
      }
    }
  }
`

const VersionCard = ({ isOpen, onClose }) => {
  const params = useParams()
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  const { data, loading } = useQuery(GetProductVersionData, {
    variables: {
      sbomId: params.sbomid,
      projectId: params.productid
    }
  })

  const { project, primaryComponent } = data?.sbom || ''

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      title='Version Details'
      Icon={GoVersions}
      noFooter={true}
    >
      {loading ? (
        <CustomLoader />
      ) : (
        <Stack spacing={2} py={3}>
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text color={primaryTextColor} fontSize={'sm'}>
              Product
            </Text>
            <CustomTag>{project?.projectGroup?.name || '-'}</CustomTag>
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text color={primaryTextColor} fontSize={'sm'}>
              Version
            </Text>
            <CustomTag>{primaryComponent?.version || '-'}</CustomTag>
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text color={primaryTextColor} fontSize={'sm'}>
              SBOM File
            </Text>
            <CustomTag>{primaryComponent?.name || '-'}</CustomTag>
          </Grid>
        </Stack>
      )}
    </LynkModal>
  )
}

export default VersionCard
