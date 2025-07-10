import {
  FormControl,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
  Text,
  Textarea
} from '@chakra-ui/react'

import LynkDate from 'components/LynkDate'
import LynkSelect from 'components/LynkSelect'
import LynkFormLabel from 'components/Misc/LynkLabel'

import { useThemeColor } from 'hooks/useThemeColors'

const materialTypeOptions = [
  { value: '', label: '-- Select --' },
  { value: 'private-key', label: 'private-key' },
  { value: 'public-key', label: 'public-key' },
  { value: 'secret-key', label: 'secret-key' },
  { value: 'key', label: 'key' },
  { value: 'ciphertext', label: 'ciphertext' },
  { value: 'signature', label: 'signature' },
  { value: 'digest', label: 'digest' },
  { value: 'initialization-vector', label: 'initialization-vector' },
  { value: 'nonce', label: 'nonce' },
  { value: 'seed', label: 'seed' },
  { value: 'salt', label: 'salt' },
  { value: 'shared-secret', label: 'shared-secret' },
  { value: 'tag', label: 'tag' },
  { value: 'additional-data', label: 'additional-data' },
  { value: 'password', label: 'password' },
  { value: 'credential', label: 'credential' },
  { value: 'token', label: 'token' },
  { value: 'other', label: 'other' },
  { value: 'unknown', label: 'unknown' }
]

const materialStateOptions = [
  { value: '', label: '-- Select --' },
  { value: 'pre-activation', label: 'pre-activation' },
  { value: 'active', label: 'active' },
  { value: 'suspended', label: 'suspended' },
  { value: 'deactivated', label: 'deactivated' },
  { value: 'compromised', label: 'compromised' },
  { value: 'destroyed', label: 'destroyed' }
]

const RelatedCryptoMaterialForm = ({ formData, setFormData }) => {
  const { secondaryTextInverse } = useThemeColor(['secondaryTextInverse'])

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      relatedCryptoMaterialProperty: {
        ...prev.relatedCryptoMaterialProperty,
        [field]: value
      }
    }))
  }

  const materialProps = formData.relatedCryptoMaterialProperty || {}

  return (
    <Stack gap={4}>
      <Text fontWeight='medium' color={secondaryTextInverse}>
        Related Crypto Material Properties
      </Text>
      <FormControl isRequired>
        <LynkFormLabel label='Type' />
        <LynkSelect
          placeholder='Select Material Type'
          value={
            materialTypeOptions.find(
              (opt) => opt.value === (materialProps.type || '')
            ) || null
          }
          onChange={(selected) =>
            handleChange('type', selected ? selected.value : '')
          }
          options={materialTypeOptions}
          dropDown
        />
      </FormControl>
      <FormControl>
        <LynkFormLabel label='Material ID' />
        <Input
          placeholder='e.g., key-12345'
          value={materialProps.materialId || ''}
          onChange={(e) => handleChange('materialId', e.target.value)}
        />
      </FormControl>
      <FormControl isRequired>
        <LynkFormLabel label='State' />
        <LynkSelect
          placeholder='Select Key State'
          value={
            materialStateOptions.find(
              (opt) => opt.value === (materialProps.state || '')
            ) || null
          }
          onChange={(selected) =>
            handleChange('state', selected ? selected.value : '')
          }
          options={materialStateOptions}
          dropDown
        />
      </FormControl>
      <FormControl>
        <LynkFormLabel label='Algorithm Reference' />
        <Input
          placeholder='e.g., RSA-2048, AES-256'
          value={materialProps.algorithmRef || ''}
          onChange={(e) => handleChange('algorithmRef', e.target.value)}
        />
      </FormControl>

      <FormControl>
        <LynkFormLabel label='Creation Date' htmlFor='creationDate' />
        <LynkDate
          name='creationDate'
          value={materialProps.creationDate}
          onChange={(momentObj) => handleChange('creationDate', momentObj)}
        />
      </FormControl>
      <FormControl>
        <LynkFormLabel label='Activation Date' htmlFor='activationDate' />
        <LynkDate
          name='activationDate'
          value={materialProps.activationDate}
          onChange={(momentObj) => handleChange('activationDate', momentObj)}
        />
      </FormControl>
      <FormControl>
        <LynkFormLabel label='Update Date' htmlFor='updateDate' />
        <LynkDate
          name='updateDate'
          value={materialProps.updateDate}
          onChange={(momentObj) => handleChange('updateDate', momentObj)}
        />
      </FormControl>
      <FormControl>
        <LynkFormLabel label='Expiration Date' htmlFor='expirationDate' />
        <LynkDate
          name='expirationDate'
          value={materialProps.expirationDate}
          onChange={(momentObj) => handleChange('expirationDate', momentObj)}
        />
      </FormControl>
      <FormControl>
        <LynkFormLabel label='Value' />
        <Textarea
          placeholder='-----BEGIN RSA PRIVATE KEY-----...'
          value={materialProps.value || ''}
          onChange={(e) => handleChange('value', e.target.value)}
        />
      </FormControl>
      <FormControl>
        <LynkFormLabel label='Size (bits)' />
        <NumberInput
          min={1}
          value={materialProps.size !== null ? materialProps.size : ''}
          onChange={(valueString) =>
            handleChange(
              'size',
              valueString === '' ? null : parseInt(valueString)
            )
          }
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
      <FormControl>
        <LynkFormLabel label='Format' />
        <Input
          placeholder='e.g., PEM, DER, JWK, Hex'
          value={materialProps.format || ''}
          onChange={(e) => handleChange('format', e.target.value)}
        />
      </FormControl>
    </Stack>
  )
}

export default RelatedCryptoMaterialForm
