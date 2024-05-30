import {
  Divider,
  Grid,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Tag,
  Text
} from '@chakra-ui/react'

const VersionTag = ({ children }) => (
  <Tag
    py={1}
    width={'130px'}
    ml={'auto'}
    size='sm'
    variant='subtle'
    colorScheme={'blue'}
    wordBreak={'break-all'}
    textAlign={'center'}
    alignItems={'center'}
    justifyContent={'center'}
  >
    {children}
  </Tag>
)

const VersionCard = ({ data, isOpen, onClose }) => {
  const { sbom } = data || ''
  const { project, primaryComponent } = sbom || ''
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Version Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Stack spacing={2} py={3}>
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Product</Text>
              <VersionTag>{project?.projectGroup?.name || '-'}</VersionTag>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Version</Text>
              <VersionTag>{primaryComponent?.version || '-'}</VersionTag>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>SBOM File</Text>
              <VersionTag>{primaryComponent?.name || '-'}</VersionTag>
            </Grid>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default VersionCard
