import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import ActionButton from 'views/Dashboard/Products/components/ActionButton'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'

import {
  Button,
  ButtonGroup,
  FormControl,
  Input,
  Stack,
  useDisclosure
} from '@chakra-ui/react'

import LynkDrawer from 'components/LynkDrawer'
import LynkSelect from 'components/LynkSelect'
import CompInfo from 'components/Misc/CompInfo'
import LynkFormLabel from 'components/Misc/LynkLabel'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import {
  CryptoPropertyCreate,
  CryptoPropertyDelete,
  CryptoPropertyUpdate
} from 'graphQL/Mutation'

import AlgorithmForm from './AlgorithmForm'
import CertificateForm from './CertificateForm'
import ProtocolForm from './ProtocolForm'
import RelatedCryptoMaterialForm from './RelatedCryptoMaterialForm'

function deepCleanTypename(obj) {
  if (Array.isArray(obj)) {
    return obj.map((item) => deepCleanTypename(item))
  } else if (obj !== null && typeof obj === 'object') {
    const newObj = {}
    for (const key in obj) {
      if (key === '__typename') {
        continue
      }
      newObj[key] = deepCleanTypename(obj[key])
    }
    return newObj
  }
  return obj
}

const assetTypeOptions = [
  { value: '', label: '-- Select  --' },
  { label: 'Algorithm', value: 'algorithm' },
  { label: 'Certificate', value: 'certificate' },
  { label: 'Protocol', value: 'protocol' },
  { label: 'Related Crypto Material', value: 'related-crypto-material' }
]

const initialCryptoPropertyState = {
  assetType: '',
  oid: '',
  algorithmProperty: {
    primitive: '',
    parameterSetIdentifier: '',
    curve: '',
    executionEnvironment: '',
    implementationPlatform: '',
    certificationLevel: [],
    mode: '',
    padding: '',
    cryptoFunctions: [],
    classicalSecurityLevel: null,
    nistQuantumSecurityLevel: 1
  },
  certificateProperty: {
    subjectName: '',
    issuerName: '',
    notValidBefore: null,
    notValidAfter: null,
    signatureAlgorithmRef: '',
    subjectPublicKeyRef: '',
    certificateFormat: '',
    certificateExtension: ''
  },
  relatedCryptoMaterialProperty: {
    type: '',
    materialId: '',
    state: '',
    algorithmRef: '',
    value: '',
    size: null,
    format: '',
    creationDate: null,
    activationDate: null,
    updateDate: null,
    expirationDate: null
  },
  protocolProperty: {
    type: '',
    version: '',
    ikev2TransformTypes: {
      encr: [],
      integ: [],
      prf: [],
      ke: [],
      esn: false,
      auth: []
    },
    cipherSuites: []
  }
}

const CryptographyDrawer = ({ data, isOpen, onClose }) => {
  const { showToast } = useCustomToast()

  const [formData, setFormData] = useState(initialCryptoPropertyState)

  const [createCryptoProperty, { loading: createLoading }] =
    useMutation(CryptoPropertyCreate)
  const [updateCryptoProperty, { loading: updateLoading }] =
    useMutation(CryptoPropertyUpdate)
  const [deleteCryptoProperty, { loading: deleteLoading }] =
    useMutation(CryptoPropertyDelete)

  const { secondaryTextInverse } = useThemeColor(['secondaryTextInverse'])

  const createEditLoading = createLoading || updateLoading

  const isEditMode = !!data?.cryptoProperty

  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose
  } = useDisclosure()

  // function getActionButtonLabel(assetType) {
  //   switch (assetType) {
  //     case 'algorithm':
  //       return 'Algorithm Property'
  //     case 'certificate':
  //       return 'Certificate Property'
  //     case 'protocol':
  //       return 'Protocol Property'
  //     case 'related-crypto-material':
  //       return 'Related Crypto Property'
  //     default:
  //       return 'Property'
  //   }
  // }

  useEffect(() => {
    if (isOpen) {
      if (data?.cryptoProperty) {
        const cryptoData = data.cryptoProperty
        const newFormData = {
          assetType: cryptoData.assetType || '',
          oid: cryptoData.oid || '',

          algorithmProperty: {
            ...initialCryptoPropertyState.algorithmProperty,
            ...(cryptoData.algorithmProperty || {}),

            cryptoFunctions:
              cryptoData.algorithmProperty?.cryptoFunctions ||
              initialCryptoPropertyState.algorithmProperty.cryptoFunctions
          },
          certificateProperty: {
            ...initialCryptoPropertyState.certificateProperty,
            ...(cryptoData.certificateProperty || {}),

            notValidBefore:
              cryptoData.certificateProperty?.notValidBefore || null,
            notValidAfter: cryptoData.certificateProperty?.notValidAfter || null
          },
          relatedCryptoMaterialProperty: {
            ...initialCryptoPropertyState.relatedCryptoMaterialProperty,
            ...(cryptoData.relatedCryptoMaterialProperty || {}),

            creationDate:
              cryptoData.relatedCryptoMaterialProperty?.creationDate || null,
            activationDate:
              cryptoData.relatedCryptoMaterialProperty?.activationDate || null,
            updateDate:
              cryptoData.relatedCryptoMaterialProperty?.updateDate || null,
            expirationDate:
              cryptoData.relatedCryptoMaterialProperty?.expirationDate || null
          },
          protocolProperty: {
            ...initialCryptoPropertyState.protocolProperty,
            ...(cryptoData.protocolProperty || {}),
            ikev2TransformTypes: {
              encr:
                cryptoData.protocolProperty?.ikev2TransformTypes?.encr || [],
              integ:
                cryptoData.protocolProperty?.ikev2TransformTypes?.integ || [],
              prf: cryptoData.protocolProperty?.ikev2TransformTypes?.prf || [],
              ke: cryptoData.protocolProperty?.ikev2TransformTypes?.ke || [],
              esn:
                cryptoData.protocolProperty?.ikev2TransformTypes?.esn ?? false,
              auth: cryptoData.protocolProperty?.ikev2TransformTypes?.auth || []
            },
            cipherSuites:
              cryptoData.protocolProperty?.cipherSuites ||
              initialCryptoPropertyState.protocolProperty.cipherSuites
          }
        }

        setFormData(newFormData)
      } else {
        setFormData(initialCryptoPropertyState)
        onAlertClose()
      }
    } else {
      setFormData(initialCryptoPropertyState)
      onAlertClose()
    }
  }, [isOpen, data, onAlertClose])

  const handleSubmit = async () => {
    const cryptoPropertyInput = {
      assetType: formData.assetType,
      oid: formData.oid
    }

    if (formData.assetType === 'algorithm') {
      cryptoPropertyInput.algorithmPropertyAttributes =
        formData.algorithmProperty
    } else if (formData.assetType === 'certificate') {
      cryptoPropertyInput.certificatePropertyAttributes = {
        ...formData.certificateProperty,
        notValidBefore: formData.certificateProperty.notValidBefore
          ? formData.certificateProperty.notValidBefore.toISOString()
          : null,
        notValidAfter: formData.certificateProperty.notValidAfter
          ? formData.certificateProperty.notValidAfter.toISOString()
          : null
      }
    } else if (formData.assetType === 'related-crypto-material') {
      cryptoPropertyInput.relatedCryptoMaterialPropertyAttributes = {
        ...formData.relatedCryptoMaterialProperty,
        creationDate: formData.relatedCryptoMaterialProperty.creationDate
          ? formData.relatedCryptoMaterialProperty.creationDate.toISOString()
          : null,
        activationDate: formData.relatedCryptoMaterialProperty.activationDate
          ? formData.relatedCryptoMaterialProperty.activationDate.toISOString()
          : null,
        updateDate: formData.relatedCryptoMaterialProperty.updateDate
          ? formData.relatedCryptoMaterialProperty.updateDate.toISOString()
          : null,
        expirationDate: formData.relatedCryptoMaterialProperty.expirationDate
          ? formData.relatedCryptoMaterialProperty.expirationDate.toISOString()
          : null
      }
    } else if (formData.assetType === 'protocol') {
      cryptoPropertyInput.protocolPropertyAttributes = {
        ...formData.protocolProperty,
        ikev2TransformTypes: {
          encr: formData.protocolProperty.ikev2TransformTypes.encr,
          integ: formData.protocolProperty.ikev2TransformTypes.integ,
          prf: formData.protocolProperty.ikev2TransformTypes.prf,
          ke: formData.protocolProperty.ikev2TransformTypes.ke,
          esn: formData.protocolProperty.ikev2TransformTypes.esn,
          auth: formData.protocolProperty.ikev2TransformTypes.auth
        },
        cipherSuitesAttributes: formData.protocolProperty.cipherSuites
      }

      delete cryptoPropertyInput.protocolPropertyAttributes.cipherSuites
    }

    const cleanedCryptoPropertyInput = deepCleanTypename(cryptoPropertyInput)

    try {
      let mutationResult
      if (isEditMode) {
        mutationResult = await updateCryptoProperty({
          variables: {
            id: data.cryptoProperty.id,
            cryptoProperty: cleanedCryptoPropertyInput
          }
        })
      } else {
        mutationResult = await createCryptoProperty({
          variables: {
            componentId: data.id,
            cryptoProperty: cleanedCryptoPropertyInput
          }
        })
      }

      const mutationErrors = isEditMode
        ? mutationResult?.data?.cryptoPropertyUpdate?.errors
        : mutationResult?.data?.cryptoPropertyCreate?.errors

      if (mutationErrors?.length) {
        showToast({
          title: `Error ${isEditMode ? 'updating' : 'creating'} crypto property`,
          description: mutationErrors.map((e) => e.message).join(', '),
          status: 'error'
        })
      } else {
        showToast({
          title: `Crypto property ${isEditMode ? 'updated' : 'created'}`,
          description: `The crypto property has been successfully ${
            isEditMode ? 'updated' : 'created'
          }.`,
          status: 'success'
        })
        onClose()
      }
    } catch (err) {
      showToast({
        title: 'Unexpected Error',
        description: err.message,
        status: 'error'
      })
    }
  }

  const handleDelete = async () => {
    onAlertClose()
    try {
      const mutationResult = await deleteCryptoProperty({
        variables: {
          id: data.cryptoProperty.id
        }
      })

      const mutationErrors = mutationResult?.data?.cryptoPropertyDelete?.errors

      if (mutationErrors?.length) {
        showToast({
          title: 'Error deleting crypto property',
          description: mutationErrors.map((e) => e.message).join(', '),
          status: 'error'
        })
      } else {
        showToast({
          title: 'Crypto property deleted',
          description: 'The crypto property has been successfully deleted.',
          status: 'success'
        })
        onClose()
      }
    } catch (err) {
      showToast({
        title: 'Unexpected Error',
        description: err.message,
        status: 'error'
      })
    }
  }

  const renderCurrentForm = () => {
    switch (formData.assetType) {
      case 'algorithm':
        return <AlgorithmForm formData={formData} setFormData={setFormData} />
      case 'certificate':
        return <CertificateForm formData={formData} setFormData={setFormData} />
      case 'protocol':
        return <ProtocolForm formData={formData} setFormData={setFormData} />
      case 'related-crypto-material':
        return (
          <RelatedCryptoMaterialForm
            formData={formData}
            setFormData={setFormData}
          />
        )
      default:
        return null
    }
  }

  // Disable action button if required fields are empty
  const isActionDisabled = (() => {
    if (!formData.assetType) return true
    if (formData.assetType === 'algorithm') {
      return (
        !formData.algorithmProperty.primitive ||
        !formData.algorithmProperty.mode ||
        !formData.algorithmProperty.padding
      )
    } else if (formData.assetType === 'certificate') {
      return (
        !formData.certificateProperty.subjectName ||
        !formData.certificateProperty.issuerName
      )
    } else if (formData.assetType === 'related-crypto-material') {
      return (
        !formData.relatedCryptoMaterialProperty.type ||
        !formData.relatedCryptoMaterialProperty.state
      )
    } else if (formData.assetType === 'protocol') {
      return !formData.protocolProperty.type
    }
    return false
  })()

  return (
    <LynkDrawer
      title={'Edit Cryptography'}
      subtitle={data && <CompInfo data={data} />}
      isOpen={isOpen}
      onClose={onClose}
      noFooter
    >
      <Stack spacing={6}>
        {/* Common Form Controls */}
        <FormControl isRequired>
          <LynkFormLabel label='Asset Type' />
          <LynkSelect
            placeholder='-- SELECT --'
            value={
              assetTypeOptions.find(
                (opt) => opt.value === (formData.assetType || '')
              ) || null
            }
            onChange={(selected) => {
              setFormData((prev) => ({
                ...initialCryptoPropertyState,
                assetType: selected ? selected.value : '',
                oid: prev.oid
              }))
            }}
            options={assetTypeOptions}
            isDisabled={isEditMode}
            dropDown
          />
        </FormControl>
        <FormControl>
          <LynkFormLabel label='OID' />
          <Input
            placeholder='e.g., 2.16.840.1.101.3.4.2.1'
            value={formData.oid}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, oid: e.target.value }))
            }
            isDisabled={isEditMode}
          />
        </FormControl>
        {/* Dynamic Form based on Asset Type */}
        {renderCurrentForm()}
        {/* Action Buttons */}
        {formData.assetType && (
          <ButtonGroup mb={4} display={'flex'}>
            <ActionButton
              isDisabled={createEditLoading || isActionDisabled}
              onClick={handleSubmit}
              title={`${isEditMode ? 'Update' : 'Create'}`}
            />
            {isEditMode && (
              <Button
                variant='ghost'
                onClick={onAlertOpen}
                isLoading={deleteLoading}
                sx={{
                  fontSize: '14px',
                  fontWeight: 400,
                  color: secondaryTextInverse
                }}
              >
                {`Delete`}
              </Button>
            )}
          </ButtonGroup>
        )}
      </Stack>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isAlertOpen}
        onClose={onAlertClose}
        onConfirm={handleDelete}
        isLoading={deleteLoading}
        title={`Delete Crypto Property`}
        description='Are you sure you want to delete this crypto property? This action cannot be undone.'
      />
    </LynkDrawer>
  )
}

export default CryptographyDrawer
