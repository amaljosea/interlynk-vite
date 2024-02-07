import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text
} from '@chakra-ui/react'
import { useMutation } from '@apollo/client'
import { sbomUpdate, CreateAutomation, recheckHealth } from 'graphQL/Mutation'
import { useLocation } from 'react-router-dom'
import SbomLicenseField from './SbomLicenseField'
import { useGlobalState } from 'hooks/useGlobalState'
import { useState } from 'react'

const LicenseModal = ({
  data,
  isOpen,
  onClose,
  checkId,
  filterRefetch,
  refetch
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')

  const { sbomState, dispatch } = useGlobalState()
  const { licenseType, spdxLicenses, customLicenses, expLicense } = sbomState
  const { sbomDispatch, prodCheckDispatch } = dispatch

  const [isValid, setIsValid] = useState(true)

  const isInvalidLicense =
    (licenseType === 'license_spdx' && spdxLicenses.length === 0) ||
    (licenseType === 'license_exp' && expLicense === '') ||
    (licenseType === 'license_custom' && customLicenses.length === 0)

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
            licensesExp:
              licenseType === 'license_exp'
                ? expLicense
                  ? expLicense
                  : ''
                : undefined
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
              value:
                licenseType === 'license_spdx'
                  ? spdxLicenses
                  : licenseType === 'license_exp'
                    ? expLicense
                    : licenseType === 'license_custom'
                      ? customLicenses
                      : ''
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
          <SbomLicenseField isValid={isValid} setIsValid={setIsValid} />
        </ModalBody>
        <ModalFooter>
          <Flex
            width={'100%'}
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            {checkId ? (
              <Button
                fontSize={'sm'}
                colorScheme='blue'
                onClick={onSaveRule}
                disabled={isInvalidLicense}
              >
                Save Rule
              </Button>
            ) : (
              <Text></Text>
            )}
            <Stack direction={'row'} spacing={2} alignItems={'center'}>
              <Button mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme='blue'
                onClick={handleUpdateSBOM}
                disabled={isInvalidLicense}
              >
                Update
              </Button>
            </Stack>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default LicenseModal
