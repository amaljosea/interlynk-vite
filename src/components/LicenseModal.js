import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

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

import { recheckHealth, sbomUpdate } from 'graphQL/Mutation'

import LicenseField from './Licenses/LicenseField'

const LicenseModal = ({ data, isOpen, onClose, checkId, refetch }) => {
  const params = useParams()
  const sbomId = params.sbomid

  const { sbomState } = useGlobalState()
  const { expLicense } = sbomState

  const [isValid, setIsValid] = useState(true)

  const isInvalidLicense = expLicense === ''

  const [healthRecheck] = useMutation(recheckHealth)

  const [updateSbom] = useMutation(sbomUpdate)

  const handleUpdateSBOM = async () => {
    await updateSbom({
      variables: {
        id: data.id,
        spec: data.spec,
        licenses: {
          licensesExp: expLicense || ''
        }
      }
    })
      .then(() => {
        if (checkId) {
          healthRecheck({
            variables: {
              checkId: checkId,
              sbomId: sbomId
            }
          }).then((res) => res?.data && refetch())
        }
      })
      .finally(() => onClose())
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add License</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <LicenseField
            sbomView={true}
            isValid={isValid}
            setIsValid={setIsValid}
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
            >
              Update
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default LicenseModal
