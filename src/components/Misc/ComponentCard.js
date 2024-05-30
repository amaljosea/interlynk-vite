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

const CompTag = ({ children }) => (
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

const ComponentCard = ({ data, isOpen, onClose }) => {
  const { group, name, version, kind } = data || ''
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Component Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Stack spacing={2} py={3}>
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Ecosystem</Text>
              <CompTag>{group || '-'}</CompTag>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Name</Text>
              <CompTag>{name || '-'}</CompTag>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Version</Text>
              <CompTag>{version || '-'}</CompTag>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Type</Text>
              <CompTag>{kind || '-'}</CompTag>
            </Grid>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default ComponentCard
