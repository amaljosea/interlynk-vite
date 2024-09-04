import { PackageURL } from 'packageurl-js'

import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons'
import { Divider, Flex, Grid, Stack, Tag, Text } from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import { FaCircleInfo } from 'react-icons/fa6'

const PurlText = ({ children }) => (
  <Tag
    width={'130px'}
    justifyContent={'center'}
    ml={'auto'}
    size='sm'
    variant='subtle'
    colorScheme={'blue'}
    wordBreak={'break-all'}
    py={1}
    textAlign={'center'}
    alignItems={'center'}
  >
    {children}
  </Tag>
)

const PurlCard = ({ value, isOpen, onClose }) => {
  const purlString = () => {
    try {
      const data = PackageURL.fromString(value)
      return data
    } catch (error) {
      console.log('error', error)
    }
  }

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      title={'PURL Details'}
      Icon={FaCircleInfo}
      noFooter
    >
      <Stack spacing={1}>
        <Tag
          justifyContent={'center'}
          alignItems={'center'}
          fontSize={'sm'}
          py={2}
          wordBreak={'break-all'}
        >
          {value}
        </Tag>
        <Divider />
        <Stack spacing={2} py={3}>
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Type</Text>
            {purlString(value)?.type && (
              <PurlText>{purlString(value)?.type}</PurlText>
            )}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Namespace</Text>
            {purlString(value)?.namespace && (
              <PurlText>{purlString(value)?.namespace}</PurlText>
            )}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Package Name</Text>
            {purlString()?.name && <PurlText>{purlString()?.name}</PurlText>}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Package Version</Text>
            {purlString()?.version && (
              <PurlText>{purlString()?.version}</PurlText>
            )}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Qualifiers</Text>
            {purlString()?.qualifiers && (
              <PurlText>{JSON.stringify(purlString()?.qualifiers)}</PurlText>
            )}
          </Grid>
          <Divider />
          <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
            <Text fontSize={'sm'}>Validity</Text>
            <Flex alignItems={'flex-end'} justifyContent={'flex-end'}>
              {purlString() ? (
                <CheckCircleIcon color={'green.500'} />
              ) : (
                <WarningIcon color={'red.500'} />
              )}
            </Flex>
          </Grid>
        </Stack>
      </Stack>
    </LynkModal>
  )
}

export default PurlCard
