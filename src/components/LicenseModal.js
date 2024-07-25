import { useMutation } from '@apollo/client'

import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay
} from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'

import { sbomUpdate } from 'graphQL/Mutation'

import LicenseField from './Licenses/LicenseField'

const LicenseModal = ({ data, isOpen, onClose, activeRow, refetch }) => {
  const { status, sbom } = activeRow || ''
  const resolved = status === 'resolved'
  const { sbomState } = useGlobalState()
  const { expLicense } = sbomState

  const isInvalidLicense = expLicense === ''

  const [updateSbom] = useMutation(sbomUpdate, {
    onCompleted: (data) => data && refetch()
  })

  const handleUpdateSBOM = () => {
    updateSbom({
      variables: {
        id: data?.id,
        spec: data?.spec,
        licenses: {
          licensesExp: expLicense || ''
        }
      }
    }).then((res) => res?.data && onClose())
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} motionPreset='slideInBottom'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{resolved ? 'View' : 'Add'} License</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <LicenseField
            sbomView={true}
            resolved={resolved}
            license={status === 'resolved' ? sbom?.licensesExp : ''}
          />
        </ModalBody>
        <ModalFooter>
          <Flex
            gap={2}
            width={'100%'}
            justifyContent={'flex-end'}
            alignItems={'center'}
          >
            <Button onClick={onClose}>Cancel</Button>
            <Button
              colorScheme='blue'
              onClick={handleUpdateSBOM}
              disabled={isInvalidLicense}
              hidden={resolved}
            >
              Save
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default LicenseModal
