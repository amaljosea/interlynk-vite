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
  const pkg = purl ? PackageURL.fromString(purl) : ''

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Component Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
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
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default ComponentCard
