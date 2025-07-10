import { useEffect, useState } from 'react'

import {
  Button,
  Checkbox,
  FormControl,
  Input,
  Stack,
  Text
} from '@chakra-ui/react'

import LynkSelect from 'components/LynkSelect'
import LynkFormLabel from 'components/Misc/LynkLabel'

import { useThemeColor } from 'hooks/useThemeColors'

const protocolTypeOptions = [
  { value: '', label: '-- Select  --' },
  { value: 'tls', label: 'Transport Layer Security' },
  { value: 'ssh', label: 'Secure Shell' },
  { value: 'ipsec', label: 'Internet Protocol Security' },
  { value: 'ike', label: 'Internet Key Exchange' },
  { value: 'sstp', label: 'Secure Socket Tunneling Protocol' },
  { value: 'wpa', label: 'Wi-Fi Protected Access' },
  { value: 'other', label: 'Another protocol type' },
  { value: 'unknown', label: 'The protocol type is not known' }
]

const ProtocolForm = ({ formData, setFormData }) => {
  const { secondaryTextInverse } = useThemeColor(['secondaryTextInverse'])

  const [ikev2InputStrings, setIkev2InputStrings] = useState({
    encr: '',
    integ: '',
    prf: '',
    ke: '',
    auth: ''
  })

  useEffect(() => {
    if (formData.protocolProperty?.ikev2TransformTypes) {
      const types = formData.protocolProperty.ikev2TransformTypes
      setIkev2InputStrings({
        encr: types.encr?.join(', ') || '',
        integ: types.integ?.join(', ') || '',
        prf: types.prf?.join(', ') || '',
        ke: types.ke?.join(', ') || '',
        auth: types.auth?.join(', ') || ''
      })
    }
  }, [formData.protocolProperty?.ikev2TransformTypes])

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      protocolProperty: {
        ...prev.protocolProperty,
        [field]: value
      }
    }))
  }

  const handleIkev2TransformInput = (category, value) => {
    setIkev2InputStrings((prev) => ({
      ...prev,
      [category]: value
    }))
  }

  const handleIkev2TransformBlur = (category) => {
    const value = ikev2InputStrings[category]
    const newArray = value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== '')

    setFormData((prev) => ({
      ...prev,
      protocolProperty: {
        ...prev.protocolProperty,
        ikev2TransformTypes: {
          ...prev.protocolProperty.ikev2TransformTypes,
          [category]: newArray
        }
      }
    }))
  }

  const handleIkev2EsnChange = (isChecked) => {
    setFormData((prev) => ({
      ...prev,
      protocolProperty: {
        ...prev.protocolProperty,
        ikev2TransformTypes: {
          ...prev.protocolProperty.ikev2TransformTypes,
          esn: isChecked
        }
      }
    }))
  }

  const handleCipherSuitesChange = (index, field, value) => {
    const newCipherSuites = [...(formData.protocolProperty?.cipherSuites || [])]
    if (!newCipherSuites[index]) {
      newCipherSuites[index] = {
        name: '',
        algorithms: { kex: '', auth: '', enc: '', mac: '' },
        identifiers: { iana: '', openssl: '' }
      }
    }

    if (field === 'name') {
      newCipherSuites[index][field] = value
    } else if (field.startsWith('algorithms.')) {
      const algoField = field.split('.')[1]
      newCipherSuites[index].algorithms[algoField] = value
    } else if (field.startsWith('identifiers.')) {
      const identField = field.split('.')[1]
      newCipherSuites[index].identifiers[identField] = value
    }

    handleChange('cipherSuites', newCipherSuites)
  }

  const addCipherSuite = () => {
    handleChange('cipherSuites', [
      ...(formData.protocolProperty?.cipherSuites || []),
      {
        name: '',
        algorithms: { kex: '', auth: '', enc: '', mac: '' },
        identifiers: { iana: '', openssl: '' }
      }
    ])
  }

  const removeCipherSuite = (index) => {
    const newCipherSuites = [...(formData.protocolProperty?.cipherSuites || [])]
    newCipherSuites.splice(index, 1)
    handleChange('cipherSuites', newCipherSuites)
  }

  const protocolProps = formData.protocolProperty || {}
  const ikev2TransformTypes = protocolProps.ikev2TransformTypes || {}
  const cipherSuites = protocolProps.cipherSuites || []

  return (
    <Stack gap={4}>
      <Text fontWeight='medium' color={secondaryTextInverse}>
        Protocol Properties
      </Text>
      <FormControl isRequired>
        <LynkFormLabel label='Type' />
        <LynkSelect
          placeholder='Select Protocol Type'
          value={
            protocolTypeOptions.find(
              (opt) => opt.value === (protocolProps.type || '')
            ) || null
          }
          onChange={(selected) =>
            handleChange('type', selected ? selected.value : '')
          }
          options={protocolTypeOptions}
          dropDown
        />
      </FormControl>
      <FormControl>
        <LynkFormLabel label='Version' />
        <Input
          placeholder='e.g., 1.3'
          value={protocolProps.version || ''}
          onChange={(e) => handleChange('version', e.target.value)}
        />
      </FormControl>

      {/* IKEv2 Transform Types */}
      <Text
        fontWeight={'medium'}
        fontSize={'small'}
        color={secondaryTextInverse}
      >
        IKEv2 Transform Types (comma separated)
      </Text>
      <FormControl>
        <LynkFormLabel label='ENCR (Encryption Algorithms)' />
        <Input
          placeholder='e.g., AES-CBC, AES-GCM'
          value={ikev2InputStrings.encr}
          onChange={(e) => handleIkev2TransformInput('encr', e.target.value)}
          onBlur={() => handleIkev2TransformBlur('encr')}
        />
      </FormControl>
      <FormControl>
        <LynkFormLabel label='INTEG (Integrity Algorithms)' />
        <Input
          placeholder='e.g., HMAC-SHA256, HMAC-SHA384'
          value={ikev2InputStrings.integ}
          onChange={(e) => handleIkev2TransformInput('integ', e.target.value)}
          onBlur={() => handleIkev2TransformBlur('integ')}
        />
      </FormControl>
      <FormControl>
        <LynkFormLabel label='PRF (Pseudorandom Functions)' />
        <Input
          placeholder='e.g., PRF-HMAC-SHA256'
          value={ikev2InputStrings.prf}
          onChange={(e) => handleIkev2TransformInput('prf', e.target.value)}
          onBlur={() => handleIkev2TransformBlur('prf')}
        />
      </FormControl>
      <FormControl>
        <LynkFormLabel label='KE (Key Exchange Method)' />
        <Input
          placeholder='e.g., MODP-2048, ECP-256'
          value={ikev2InputStrings.ke}
          onChange={(e) => handleIkev2TransformInput('ke', e.target.value)}
          onBlur={() => handleIkev2TransformBlur('ke')}
        />
      </FormControl>

      <FormControl>
        <LynkFormLabel label='AUTH (Authentication Method)' />
        <Input
          placeholder='e.g., PSK, RSA'
          value={ikev2InputStrings.auth}
          onChange={(e) => handleIkev2TransformInput('auth', e.target.value)}
          onBlur={() => handleIkev2TransformBlur('auth')}
        />
      </FormControl>

      <FormControl display='flex' alignItems='center'>
        <LynkFormLabel label='ESN (Extended Sequence Number)' />
        <Checkbox
          isChecked={!!ikev2TransformTypes.esn}
          onChange={(e) => handleIkev2EsnChange(e.target.checked)}
        />
      </FormControl>

      {/* Cipher Suites */}
      <Text
        fontWeight={'medium'}
        fontSize={'small'}
        color={secondaryTextInverse}
      >
        Cipher Suites
      </Text>
      {cipherSuites.map((suite, index) => (
        <Stack key={index} borderWidth='1px' p={3} borderRadius='md' mt={2}>
          <Text fontWeight='medium'>Cipher Suite {index + 1}</Text>
          <FormControl>
            <LynkFormLabel label='Name' />
            <Input
              value={suite.name || ''}
              onChange={(e) =>
                handleCipherSuitesChange(index, 'name', e.target.value)
              }
            />
          </FormControl>
          <Text fontSize='sm' mt={2}>
            Algorithms
          </Text>
          <FormControl ml={4}>
            <LynkFormLabel label='Kex' />
            <Input
              value={suite.algorithms?.kex || ''}
              onChange={(e) =>
                handleCipherSuitesChange(
                  index,
                  'algorithms.kex',
                  e.target.value
                )
              }
            />
          </FormControl>
          <FormControl ml={4}>
            <LynkFormLabel label='Auth' />
            <Input
              value={suite.algorithms?.auth || ''}
              onChange={(e) =>
                handleCipherSuitesChange(
                  index,
                  'algorithms.auth',
                  e.target.value
                )
              }
            />
          </FormControl>
          <FormControl ml={4}>
            <LynkFormLabel label='Enc' />
            <Input
              value={suite.algorithms?.enc || ''}
              onChange={(e) =>
                handleCipherSuitesChange(
                  index,
                  'algorithms.enc',
                  e.target.value
                )
              }
            />
          </FormControl>
          <FormControl ml={4}>
            <LynkFormLabel label='Mac' />
            <Input
              value={suite.algorithms?.mac || ''}
              onChange={(e) =>
                handleCipherSuitesChange(
                  index,
                  'algorithms.mac',
                  e.target.value
                )
              }
            />
          </FormControl>

          <Text fontSize='sm' mt={2}>
            Identifiers
          </Text>
          <FormControl ml={4}>
            <LynkFormLabel label='IANA' />
            <Input
              value={suite.identifiers?.iana || ''}
              onChange={(e) =>
                handleCipherSuitesChange(
                  index,
                  'identifiers.iana',
                  e.target.value
                )
              }
            />
          </FormControl>
          <FormControl ml={4}>
            <LynkFormLabel label='OpenSSL' />
            <Input
              value={suite.identifiers?.openssl || ''}
              onChange={(e) =>
                handleCipherSuitesChange(
                  index,
                  'identifiers.openssl',
                  e.target.value
                )
              }
            />
          </FormControl>
          <Button
            size='sm'
            colorScheme='red'
            onClick={() => removeCipherSuite(index)}
          >
            Remove Cipher Suite
          </Button>
        </Stack>
      ))}
      <Button size='sm' onClick={addCipherSuite}>
        Add Cipher Suite
      </Button>
    </Stack>
  )
}

export default ProtocolForm
