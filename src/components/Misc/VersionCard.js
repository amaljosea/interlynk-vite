import { Divider, Grid, Stack, Text, useColorModeValue } from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import { GoVersions } from 'react-icons/go'

import CustomTag from './CustomTag'

const VersionCard = ({ data, isOpen, onClose }) => {
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')
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
          <Text color={textColor} fontSize={'sm'}>
            Product
          </Text>
          <CustomTag>{project?.projectGroup?.name || '-'}</CustomTag>
        </Grid>
        <Divider />
        <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
          <Text color={textColor} fontSize={'sm'}>
            Version
          </Text>
          <CustomTag>{primaryComponent?.version || '-'}</CustomTag>
        </Grid>
        <Divider />
        <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
          <Text color={textColor} fontSize={'sm'}>
            SBOM File
          </Text>
          <CustomTag>{primaryComponent?.name || '-'}</CustomTag>
        </Grid>
      </Stack>
    </LynkModal>
  )
}

export default VersionCard
