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
import GlobalContext from 'context/GlobalContext'
import { useContext } from 'react'
import LicenseField from './LicenseField'
import { useMutation } from '@apollo/client'
import { sbomUpdate } from 'graphQL/Mutation'
import { useLocation } from 'react-router-dom'
import { CreateAutomation } from 'graphQL/Mutation'
import { recheckHealth } from 'graphQL/Mutation'

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
  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const {
    licenseType,
    spdxLicense,
    licenseExp,
    customLicense,
    setCheckFilters
  } = useContext(GlobalContext)

  const isDisabled =
    (licenseType === 'license_spdx' && spdxLicense.length === 0) ||
    (licenseType === 'license_exp' && licenseExp === '') ||
    (licenseType === 'license_custom' && customLicense === '')

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
    }).then((res) => setCheckFilters(res.data.sbom.filters))
  }

  const handleUpdateSBOM = async () => {
    try {
      await updateSbom({
        variables: {
          id: data.id,
          spec: data.spec,
          licenses: licenseType === 'license_spdx' ? spdxLicense : undefined,
          licenseExp: licenseType === 'license_exp' ? licenseExp : undefined
        }
      })
        .then((res) => {
          if (res.data) {
            onFilterRefetch()
            if (checkId) {
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
                  ? spdxLicense
                  : licenseType === 'license_exp'
                  ? licenseExp
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
          <LicenseField exp={data?.licenseExp} />
        </ModalBody>
        <ModalFooter>
          <Flex
            width={'100%'}
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            {checkId ? (
              <Button fontSize={'sm'} colorScheme='blue' onClick={onSaveRule}>
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
                disabled={isDisabled}
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
