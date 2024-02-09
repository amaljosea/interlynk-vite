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

const CpeText = ({ children }) => (
  <Text fontSize='sm' textAlign={'right'} fontWeight={'semibold'}>
    {children}
  </Text>
)

const CpeCard = ({ value, isOpen, onClose }) => {
  const filterString = value?.replace(/[\[\]"]/g, '') || ''
  const cpeString = filterString.split(':')

  const setType = (value) => {
    switch (value) {
      case 'a':
        return 'Application'
      case 'h':
        return 'Hardware'
      case 'o':
        return 'Operating System'
      default:
        return ''
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>CPE Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Text fontWeight={'semibold'} py={2}>
            {value}
          </Text>
          <Divider />
          <Stack spacing={2} py={3}>
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Part</Text>
              <CpeText>{setType(cpeString[2] || '')}</CpeText>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Vendor</Text>
              <CpeText>{cpeString[3] || ''}</CpeText>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Product</Text>
              <CpeText>{cpeString[4] || ''}</CpeText>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Version</Text>
              <CpeText>{cpeString[5] || ''}</CpeText>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Update</Text>
              <CpeText>{cpeString[6] || ''}</CpeText>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Edition</Text>
              <CpeText>{cpeString[7] || ''}</CpeText>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Language</Text>
              <CpeText>{cpeString[8] || ''}</CpeText>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>SW Edition</Text>
              <CpeText>{cpeString[9] || ''}</CpeText>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Target Software</Text>
              <CpeText>{cpeString[10] || ''}</CpeText>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Hardware</Text>
              <CpeText>{cpeString[11] || ''}</CpeText>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Other</Text>
              <CpeText>{cpeString[12] || ''}</CpeText>
            </Grid>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default CpeCard
