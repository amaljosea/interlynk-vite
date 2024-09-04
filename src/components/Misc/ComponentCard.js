import { PackageURL } from 'packageurl-js'
import { useEffect, useState } from 'react'

import { Divider, Grid, Stack, Text, useColorModeValue } from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import { BiLayer } from 'react-icons/bi'

import CustomTag from './CustomTag'

const ListItem = ({ label, value }) => {
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')
  return (
    <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
      <Text color={textColor} fontSize={'sm'}>
        {label}
      </Text>
      <CustomTag>{value || '-'}</CustomTag>
    </Grid>
  )
}

const ComponentCard = ({ data, isOpen, onClose }) => {
  const { name, version, kind, purl, licensesExp, primary, internal } =
    data || ''

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
    </LynkModal>
  )
}

export default ComponentCard
