import { PackageURL } from 'packageurl-js'
import { useEffect, useState } from 'react'

import { Divider, Grid, Stack, Text } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import LynkModal from 'components/LynkModal'

import { useThemeColor } from 'hooks/useThemeColors'

import { BiLayer } from 'react-icons/bi'

import CustomTag from './CustomTag'

const ListItem = ({ label, value }) => {
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])
  return (
    <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
      <Text color={primaryTextColor} fontSize={'sm'}>
        {label}
      </Text>
      <CustomTag>{value || '-'}</CustomTag>
    </Grid>
  )
}

const ComponentCard = ({ data, isOpen, onClose, loading }) => {
  const { name, version, kind, purl, licensesExp, primary, internal } = data || ''
  const [pkg, setPkg] = useState(null)

  useEffect(() => {
    if (purl) {
      try {
        PackageURL.fromString(purl)
        setPkg(true)
      } catch (ex) {
        console.error('ex', ex)
      }
    }
  }, [purl])

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      title='Component Details'
      Icon={BiLayer}
      noFooter={true}
    >
      {loading ? (
        <CustomLoader />
      ) : (
        <Stack spacing={2} py={3}>
          <ListItem label={'Ecosystem'} value={pkg?.type} />
          <Divider />
          <ListItem label={'Name'} value={name} />
          <Divider />
          <ListItem label={'Version'} value={version} />
          <Divider />
          <ListItem label={'Type'} value={kind} />
          <Divider />
          <ListItem label={'License'} value={licensesExp} />
          <Divider />
          <ListItem label={'Primary'} value={primary ? 'Yes' : 'No'} />
          <Divider />
          <ListItem label={'Internal'} value={internal ? 'Yes' : 'No'} />
        </Stack>
      )}
    </LynkModal>
  )
}

export default ComponentCard
