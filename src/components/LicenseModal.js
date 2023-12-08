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
import { useMutation } from '@apollo/client'
import { sbomUpdate, CreateAutomation, recheckHealth } from 'graphQL/Mutation'
import { useLocation } from 'react-router-dom'
import SbomLicenseField from './SbomLicenseField'

const LicenseModal = ({
  data,
  isOpen,
  onClose,
  checkId,
  filterRefetch,
  refetch,
  setPageIndex
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const {
    sbomLicenseType,
    sbomSpdxLicense,
    sbomLicenseExp,
    sbomCustomLicense,
    setCheckFilters
  } = useContext(GlobalContext)

  const isInvalidLicense =
    (sbomLicenseType === 'license_spdx' && sbomSpdxLicense.length === 0) ||
    (sbomLicenseType === 'license_exp' && sbomLicenseExp === '') ||
    (sbomLicenseType === 'license_custom' && sbomCustomLicense.length === 0)

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
          licenses: {
            licenses:
              sbomLicenseType === 'license_spdx' ? sbomSpdxLicense : undefined,
            licensesExp:
              sbomLicenseType === 'license_exp' ? sbomLicenseExp : undefined,
            licensesCustom:
              sbomLicenseType === 'license_custom'
                ? sbomCustomLicense
                : undefined
          }
        }
      })
        .then((res) => {
          if (res.data) {
            onFilterRefetch()
            if (checkId) {
              setPageIndex(1)
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
          attr: sbomLicenseType,
          enabled: true,
          set: JSON.stringify(
            {
              value:
                sbomLicenseType === 'license_spdx'
                  ? sbomSpdxLicense
                  : sbomLicenseType === 'license_exp'
                  ? sbomLicenseExp
                  : sbomLicenseType === 'license_custom'
                  ? sbomCustomLicense
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
          <SbomLicenseField exp={data?.licenseExp} />
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
