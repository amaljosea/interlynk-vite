import { FormControl, Input, Stack, Text } from '@chakra-ui/react'

import LynkDate from 'components/LynkDate'
import LynkFormLabel from 'components/Misc/LynkLabel'

import { useThemeColor } from 'hooks/useThemeColors'

const CertificateForm = ({ formData, setFormData }) => {
  const { secondaryTextInverse } = useThemeColor(['secondaryTextInverse'])

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      certificateProperty: {
        ...prev.certificateProperty,
        [field]: value
      }
    }))
  }

  const certProps = formData.certificateProperty || {}

  return (
    <Stack gap={4}>
      <Text fontWeight='medium' color={secondaryTextInverse}>
        Certificate Properties
      </Text>
      <FormControl isRequired>
        <LynkFormLabel label='Subject Name' />
        <Input
          placeholder='e.g., CN=example.com, O=Example Inc, C=US'
          value={certProps.subjectName || ''}
          onChange={(e) => handleChange('subjectName', e.target.value)}
        />
      </FormControl>
      <FormControl isRequired>
        <LynkFormLabel label='Issuer Name' />
        <Input
          placeholder='e.g., CN=Example CA, O=Example Inc, C=US'
          value={certProps.issuerName || ''}
          onChange={(e) => handleChange('issuerName', e.target.value)}
        />
      </FormControl>

      <FormControl>
        <LynkFormLabel label='Not Valid Before' htmlFor='notValidBefore' />
        <LynkDate
          name='notValidBefore'
          value={certProps.notValidBefore}
          onChange={(momentObj) => handleChange('notValidBefore', momentObj)}
        />
      </FormControl>

      <FormControl>
        <LynkFormLabel label='Not Valid After' htmlFor='notValidAfter' />
        <LynkDate
          name='notValidAfter'
          value={certProps.notValidAfter}
          onChange={(momentObj) => handleChange('notValidAfter', momentObj)}
        />
      </FormControl>

      <FormControl>
        <LynkFormLabel label='Signature Algorithm Reference' />
        <Input
          placeholder='e.g., SHA256withRSA'
          value={certProps.signatureAlgorithmRef || ''}
          onChange={(e) =>
            handleChange('signatureAlgorithmRef', e.target.value)
          }
        />
      </FormControl>
      <FormControl>
        <LynkFormLabel label='Subject Public Key Reference' />
        <Input
          placeholder='e.g., RSA-2048'
          value={certProps.subjectPublicKeyRef || ''}
          onChange={(e) => handleChange('subjectPublicKeyRef', e.target.value)}
        />
      </FormControl>
      <FormControl>
        <LynkFormLabel label='Certificate Format' />
        <Input
          placeholder='e.g., X.509'
          value={certProps.certificateFormat || ''}
          onChange={(e) => handleChange('certificateFormat', e.target.value)}
        />
      </FormControl>
      <FormControl>
        <LynkFormLabel label='Certificate Extension' />
        <Input
          placeholder='e.g., crt'
          value={certProps.certificateExtension || ''}
          onChange={(e) => handleChange('certificateExtension', e.target.value)}
        />
      </FormControl>
    </Stack>
  )
}

export default CertificateForm
