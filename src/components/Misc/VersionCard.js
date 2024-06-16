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
  Text,
  useColorModeValue
} from '@chakra-ui/react'

import CustomTag from './CustomTag'

const VersionCard = ({ data, isOpen, onClose }) => {
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')
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
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default VersionCard
