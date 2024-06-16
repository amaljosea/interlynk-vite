import { PackageURL } from 'packageurl-js'

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

const ComponentCard = ({ data, isOpen, onClose }) => {
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')
  const { name, version, kind, purl } = data || ''
  const pkg = purl ? PackageURL.fromString(purl) : ''

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Component Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Stack spacing={2} py={3}>
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text color={textColor} fontSize={'sm'}>
                Ecosystem
              </Text>
              <CustomTag>{pkg?.type || '-'}</CustomTag>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text color={textColor} fontSize={'sm'}>
                Name
              </Text>
              <CustomTag>{name || '-'}</CustomTag>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text color={textColor} fontSize={'sm'}>
                Version
              </Text>
              <CustomTag>{version || '-'}</CustomTag>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text color={textColor} fontSize={'sm'}>
                Type
              </Text>
              <CustomTag>{kind || '-'}</CustomTag>
            </Grid>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default ComponentCard
