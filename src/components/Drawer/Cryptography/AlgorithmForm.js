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

import LynkSelect from 'components/LynkSelect'
import LynkFormLabel from 'components/Misc/LynkLabel'

import { useThemeColor } from 'hooks/useThemeColors'

const primitiveOptions = [
  { value: '', label: '-- Select  --' },
  { value: 'drbg', label: 'Deterministic Random Bit Generator (DRBG)' },
  { value: 'mac', label: 'Message Authentication Code (MAC)' },
  { value: 'block-cipher', label: 'Block Cipher' },
  { value: 'stream-cipher', label: 'Stream Cipher' },
  { value: 'signature', label: 'Signature' },
  { value: 'hash', label: 'Hash' },
  { value: 'pke', label: 'Public Key Encryption (PKE)' },
  { value: 'xof', label: 'Extendable Output Function (XOF)' },
  { value: 'kdf', label: 'Key Derivation Function (KDF)' },
  { value: 'key-agree', label: 'Key Agreement' },
  { value: 'kem', label: 'Key Encapsulation Mechanism' },
  { value: 'ae', label: 'Authenticated Encryption' },
  { value: 'combiner', label: 'Combiner' },
  { value: 'other', label: 'Other' },
  { value: 'unknown', label: 'Unknown' }
]

const modeOptions = [
  { value: '', label: '-- Select --' },
  { value: 'cbc', label: 'Cipher block chaining' },
  { value: 'ecb', label: 'Electronic codebook' },
  {
    value: 'ccm',
    label: 'Counter with cipher block chaining message authentication code'
  },
  { value: 'gcm', label: 'Galois/counter' },
  { value: 'cfb', label: 'Cipher feedback' },
  { value: 'ofb', label: 'Output feedback' },
  { value: 'ctr', label: 'Counter' },
  { value: 'other', label: 'Another mode of operation' },
  { value: 'unknown', label: 'The mode of operation is not known' }
]

const paddingOptions = [
  { value: '', label: '-- Select --' },
  {
    value: 'pkcs5',
    label: 'Public Key Cryptography Standard: Password-Based Cryptography'
  },
  {
    value: 'pkcs7',
    label: 'Public Key Cryptography Standard: Cryptographic Message Syntax'
  },
  {
    value: 'pkcs1v15',
    label: 'Public Key Cryptography Standard: RSA Cryptography v1.5'
  },
  { value: 'oaep', label: 'Optimal asymmetric encryption padding' },
  { value: 'raw', label: 'Raw' },
  { value: 'other', label: 'Another padding scheme' },
  { value: 'unknown', label: 'The padding scheme is not known' }
]

const executionEnvironmentOptions = [
  { value: '', label: '-- Select --' },
  { value: 'software-plain-ram', label: 'Software (Plain RAM)' },
  { value: 'software-encrypted-ram', label: 'Software (Encrypted RAM)' },
  { value: 'software-tee', label: 'Software (Trusted Execution Environment)' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'other', label: 'Other' },
  { value: 'unknown', label: 'Unknown' }
]

const implementationPlatformOptions = [
  { value: '', label: '-- Select --' },
  { value: 'generic', label: 'Generic' },
  { value: 'x86_32', label: 'x86_32' },
  { value: 'x86_64', label: 'x86_64' },
  { value: 'armv7-a', label: 'ARMv7-A' },
  { value: 'armv7-m', label: 'ARMv7-M' },
  { value: 'armv8-a', label: 'ARMv8-A' },
  { value: 'armv8-m', label: 'ARMv8-M' },
  { value: 'armv9-a', label: 'ARMv9-A' },
  { value: 'armv9-m', label: 'ARMv9-M' },
  { value: 's390x', label: 's390x' },
  { value: 'ppc64', label: 'PPC64' },
  { value: 'ppc64le', label: 'PPC64LE' },
  { value: 'other', label: 'Other' },
  { value: 'unknown', label: 'Unknown' }
]

const certificationLevelOptions = [
  { value: '', label: '-- Select --' },
  { value: 'none', label: 'No certification obtained' },
  { value: 'fips140-1-l1', label: 'FIPS 140-1 Level 1' },
  { value: 'fips140-1-l2', label: 'FIPS 140-1 Level 2' },
  { value: 'fips140-1-l3', label: 'FIPS 140-1 Level 3' },
  { value: 'fips140-1-l4', label: 'FIPS 140-1 Level 4' },
  { value: 'fips140-2-l1', label: 'FIPS 140-2 Level 1' },
  { value: 'fips140-2-l2', label: 'FIPS 140-2 Level 2' },
  { value: 'fips140-2-l3', label: 'FIPS 140-2 Level 3' },
  { value: 'fips140-2-l4', label: 'FIPS 140-2 Level 4' },
  { value: 'fips140-3-l1', label: 'FIPS 140-3 Level 1' },
  { value: 'fips140-3-l2', label: 'FIPS 140-3 Level 2' },
  { value: 'fips140-3-l3', label: 'FIPS 140-3 Level 3' },
  { value: 'fips140-3-l4', label: 'FIPS 140-3 Level 4' },
  { value: 'cc-eal1', label: 'Common Criteria - Evaluation Assurance Level 1' },
  {
    value: 'cc-eal1+',
    label: 'Common Criteria - Evaluation Assurance Level 1 (Augmented)'
  },
  { value: 'cc-eal2', label: 'Common Criteria - Evaluation Assurance Level 2' },
  {
    value: 'cc-eal2+',
    label: 'Common Criteria - Evaluation Assurance Level 2 (Augmented)'
  },
  { value: 'cc-eal3', label: 'Common Criteria - Evaluation Assurance Level 3' },
  {
    value: 'cc-eal3+',
    label: 'Common Criteria - Evaluation Assurance Level 3 (Augmented)'
  },
  { value: 'cc-eal4', label: 'Common Criteria - Evaluation Assurance Level 4' },
  {
    value: 'cc-eal4+',
    label: 'Common Criteria - Evaluation Assurance Level 4 (Augmented)'
  },
  { value: 'cc-eal5', label: 'Common Criteria - Evaluation Assurance Level 5' },
  {
    value: 'cc-eal5+',
    label: 'Common Criteria - Evaluation Assurance Level 5 (Augmented)'
  },
  { value: 'cc-eal6', label: 'Common Criteria - Evaluation Assurance Level 6' },
  {
    value: 'cc-eal6+',
    label: 'Common Criteria - Evaluation Assurance Level 6 (Augmented)'
  },
  { value: 'cc-eal7', label: 'Common Criteria - Evaluation Assurance Level 7' },
  {
    value: 'cc-eal7+',
    label: 'Common Criteria - Evaluation Assurance Level 7 (Augmented)'
  },
  { value: 'other', label: 'Another certification' },
  { value: 'unknown', label: 'The certification level is not known' }
]

const AlgorithmForm = ({ formData, setFormData }) => {
  const { secondaryTextInverse } = useThemeColor(['secondaryTextInverse'])

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      algorithmProperty: {
        ...prev.algorithmProperty,
        [field]: value
      }
    }))
  }

  const handleCryptoFunctionsChange = (e) => {
    const value = e.target.value
    const functionsArray = value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== '')
    handleChange('cryptoFunctions', functionsArray)
  }

  const algoProps = formData.algorithmProperty || {}

  return (
    <Stack gap={4}>
      <Text fontWeight='medium' color={secondaryTextInverse}>
        Algorithm Properties
      </Text>
      <FormControl isRequired>
        <LynkFormLabel label='Primitive' />
        <LynkSelect
          value={
            primitiveOptions.find(
              (opt) => opt.value === (algoProps.primitive || '')
            ) || null
          }
          onChange={(selected) =>
            handleChange('primitive', selected ? selected.value : '')
          }
          options={primitiveOptions}
          dropDown
        />
      </FormControl>

      <FormControl>
        <LynkFormLabel label='Parameter Set Identifier' />
        <Input
          placeholder='e.g., NIST P-256'
          value={algoProps.parameterSetIdentifier || ''}
          onChange={(e) =>
            handleChange('parameterSetIdentifier', e.target.value)
          }
        />
      </FormControl>

      <FormControl>
        <LynkFormLabel label='Curve' />
        <Input
          placeholder='e.g., P-256'
          value={algoProps.curve || ''}
          onChange={(e) => handleChange('curve', e.target.value)}
        />
      </FormControl>

      <FormControl>
        <LynkFormLabel label='Execution Environment' />
        <LynkSelect
          value={
            executionEnvironmentOptions.find(
              (opt) => opt.value === (algoProps.executionEnvironment || '')
            ) || null
          }
          onChange={(selected) =>
            handleChange('executionEnvironment', selected ? selected.value : '')
          }
          options={executionEnvironmentOptions}
          dropDown
        />
      </FormControl>

      <FormControl>
        <LynkFormLabel label='Implementation Platform' />
        <LynkSelect
          value={
            implementationPlatformOptions.find(
              (opt) => opt.value === (algoProps.implementationPlatform || '')
            ) || null
          }
          onChange={(selected) =>
            handleChange(
              'implementationPlatform',
              selected ? selected.value : ''
            )
          }
          options={implementationPlatformOptions}
          dropDown
        />
      </FormControl>

      <FormControl>
        <LynkFormLabel label='Certification Level' />
        <LynkSelect
          value={
            certificationLevelOptions.find(
              (opt) => opt.value === (algoProps.certificationLevel || '')
            ) || null
          }
          onChange={(selected) =>
            handleChange('certificationLevel', selected ? selected.value : '')
          }
          options={certificationLevelOptions}
          dropDown
        />
      </FormControl>

      <FormControl isRequired>
        <LynkFormLabel label='Mode' />
        <LynkSelect
          value={
            modeOptions.find((opt) => opt.value === (algoProps.mode || '')) ||
            null
          }
          onChange={(selected) =>
            handleChange('mode', selected ? selected.value : '')
          }
          options={modeOptions}
          dropDown
        />
      </FormControl>

      <FormControl isRequired>
        <LynkFormLabel label='Padding' />
        <LynkSelect
          value={
            paddingOptions.find(
              (opt) => opt.value === (algoProps.padding || '')
            ) || null
          }
          onChange={(selected) =>
            handleChange('padding', selected ? selected.value : '')
          }
          options={paddingOptions}
          dropDown
        />
      </FormControl>

      <FormControl>
        <LynkFormLabel label='Crypto Functions (comma separated)' />
        <Textarea
          placeholder='e.g., keygen, sign, verify'
          value={algoProps.cryptoFunctions?.join(', ') || ''}
          onChange={handleCryptoFunctionsChange}
        />
      </FormControl>

      <FormControl>
        <LynkFormLabel label='Classical Security Level' />
        <NumberInput
          min={0}
          value={
            algoProps.classicalSecurityLevel !== null
              ? algoProps.classicalSecurityLevel
              : ''
          }
          onChange={(valueString) =>
            handleChange(
              'classicalSecurityLevel',
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
        <LynkFormLabel label='NIST Quantum Security Level' />
        <NumberInput
          min={1}
          max={5}
          value={algoProps.nistQuantumSecurityLevel || 1}
          onChange={(valueString) =>
            handleChange('nistQuantumSecurityLevel', parseInt(valueString))
          }
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
    </Stack>
  )
}

export default AlgorithmForm
