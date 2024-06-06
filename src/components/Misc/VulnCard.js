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
  Text
} from '@chakra-ui/react'

import CustomTag from './CustomTag'

const VulnCard = ({ data, isOpen, onClose }) => {
  const { vuln } = data || ''
  const { vulnId, source, cvssScore, vulnInfo } = vuln || ''
  const { epssScores, kev } = vulnInfo || ''
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Vulnerability Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Stack spacing={2} py={3}>
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>ID</Text>
              <CustomTag>{vulnId || '-'}</CustomTag>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>Source</Text>
              <CustomTag>{source || '-'}</CustomTag>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>CVSS Score</Text>
              <CustomTag>{cvssScore || '-'}</CustomTag>
            </Grid>
            <Divider />
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>EPSS</Text>
              <CustomTag>{epssScores || '-'}</CustomTag>
            </Grid>
            <Grid alignItems={'center'} templateColumns='repeat(2, 1fr)'>
              <Text fontSize={'sm'}>KEV</Text>
              <CustomTag>{kev || '-'}</CustomTag>
            </Grid>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default VulnCard
