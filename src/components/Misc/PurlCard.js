import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons'
import {
  Stack,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Divider,
  Grid
} from '@chakra-ui/react'
import { PackageURL } from 'packageurl-js'

const PurlText = ({ children }) => (
  <Text fontSize='sm' textAlign={'right'} fontWeight={'semibold'}>
    {children}
  </Text>
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>PURL</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Text fontWeight={'semibold'} py={2}>
            {value}
          </Text>
          <Divider />
          <Stack spacing={2} py={3}>
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Type</Text>
              <PurlText>{purlString(value)?.type || 'Unknown'}</PurlText>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Namespace</Text>
              <PurlText>{purlString()?.namespace || 'Unknown'}</PurlText>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Package Name</Text>
              <PurlText>{purlString()?.name || 'Unknown'}</PurlText>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Package Version</Text>
              <PurlText>{purlString()?.version || 'Unknown'}</PurlText>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Qualifiers</Text>
              <PurlText>
                {purlString()?.qualifiers
                  ? JSON.stringify(purlString()?.qualifiers)
                  : 'Unknown'}
              </PurlText>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Validity</Text>
              <PurlText>
                {purlString() ? (
                  <CheckCircleIcon color={'green.500'} />
                ) : (
                  <WarningIcon color={'red.500'} />
                )}
              </PurlText>
            </Grid>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default PurlCard
