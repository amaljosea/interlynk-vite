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
  ModalOverlay,
  useToast
} from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'

import {
  AutomationRuleCreate,
  recheckHealth,
  sbomUpdate
} from 'graphQL/Mutation'

import LicenseField from './Licenses/LicenseField'

const LicenseModal = ({ data, isOpen, onClose, activeRow, refetch }) => {
  const toast = useToast()
  const params = useParams()
  const sbomId = params.sbomid
  const productId = params.productid

  const { status, sbom } = activeRow || ''
  const { friendlyId, shortDesc } = activeRow?.organizationRule?.rule || ''

  const { sbomState } = useGlobalState()
  const { expLicense } = sbomState

  const [isValid, setIsValid] = useState(true)

  const isInvalidLicense = expLicense === ''

  const [healthRecheck] = useMutation(recheckHealth)
  const [createRule] = useMutation(AutomationRuleCreate)
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
        if (friendlyId) {
          healthRecheck({
            variables: {
              checkId: friendlyId,
              sbomId: sbomId
            }
          }).then((res) => res?.data && refetch())
        }
      })
      .finally(() => onClose())
  }

  const getConditionsAttributes = [
    {
      subject: 'version',
      operator: 'not_exists',
      field: 'version_licenses_exp',
      value: undefined
    }
  ]

  const getActionsAttributes = [
    {
      subject: 'version',
      field: 'version_licenses_exp',
      value: expLicense
    }
  ]

  const handleRuleCreate = async () => {
    await createRule({
      variables: {
        name: shortDesc,
        active: true,
        projectId: productId,
        automationConditionsAttributes: getConditionsAttributes,
        automationActionsAttributes: getActionsAttributes
      }
    }).then((res) => {
      const errors = res?.data?.automationRuleCreate?.errors
      if (errors?.length > 0) {
        console.log(errors[0])
      } else {
        toast({
          description: 'Rule added successfully',
          duration: 3000,
          status: 'success',
          position: 'top'
        })
        onClose()
      }
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} motionPreset='slideInBottom'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add License</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <LicenseField
            sbomView={true}
            isValid={isValid}
            setIsValid={setIsValid}
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
            <Button
              fontSize={'sm'}
              colorScheme='blue'
              mr={'auto'}
              onClick={handleRuleCreate}
            >
              Save as Rule
            </Button>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              colorScheme='blue'
              onClick={handleUpdateSBOM}
              disabled={isInvalidLicense}
              hidden={status === 'resolved'}
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
