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

import { CreateAutomation, recheckHealth, sbomUpdate } from 'graphQL/Mutation'

import LicenseField from './Licenses/LicenseField'

const LicenseModal = ({
  data,
  isOpen,
  onClose,
  checkId,
  filterRefetch,
  refetch
}) => {
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid

  const { sbomState, dispatch } = useGlobalState()
  const { licenseType, spdxLicenses, customLicenses, expLicense } = sbomState
  const { sbomDispatch, prodCheckDispatch } = dispatch

  const [isValid, setIsValid] = useState(true)

  const isInvalidLicense = expLicense === ''

  const handleRefetch = () => {
    refetch({
      projectId: productId,
      sbomId: sbomId
    })
  }

  const [healthRecheck] = useMutation(recheckHealth, {
    onCompleted: () => refetch()
  })

  const [updateSbom] = useMutation(sbomUpdate, {
    onCompleted: () => handleRefetch()
  })

  const [createAutoCheck] = useMutation(CreateAutomation)

  const onFilterRefetch = () => {
    filterRefetch({
      projectId: productId,
      sbomId: sbomId
    }).then((res) =>
      prodCheckDispatch({
        type: 'ADD_FILTER_HEADS',
        payload: res.data.sbom.filters
      })
    )
  }

  const handleUpdateSBOM = async () => {
    try {
      await updateSbom({
        variables: {
          id: data.id,
          spec: data.spec,
          licenses: {
            licensesExp: expLicense || ''
          }
        }
      })
        .then((res) => {
          if (res.data) {
            onFilterRefetch()
            if (checkId) {
              prodCheckDispatch({ type: 'FETCH_DATA_SUCCESS' })
              healthRecheck({
                variables: {
                  checkId: checkId,
                  sbomId: sbomId
                }
              })
            }
          }
        })
        .finally(() => onClose())
    } catch (error) {
      console.log(`Mutation error `, error)
    }
  }

  const onSaveRule = async () => {
    try {
      await createAutoCheck({
        variables: {
          projectId: productId,
          applicable: 'document',
          condition: 'missing',
          attr: licenseType,
          enabled: true,
          set: JSON.stringify(
            {
              value: expLicense || ''
            },
            null,
            2
          )
        }
      }).then((res) => res.data && handleUpdateSBOM())
    } catch (error) {
      console.log('Error', error)
    }
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
