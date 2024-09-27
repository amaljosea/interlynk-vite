import { Divider, Grid, Stack, Text } from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import { useThemeColor } from 'hooks/useThemeColors'

import { GoVersions } from 'react-icons/go'

import CustomTag from './CustomTag'

const VersionCard = ({ data, isOpen, onClose }) => {
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])
  const { sbom } = data || ''
  const { project, primaryComponent } = sbom || ''
  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      title='Version Details'
      Icon={GoVersions}
      noFooter={true}
    >
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
    </LynkModal>
  )
}

export default VersionCard
