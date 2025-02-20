import { useEffect, useState } from 'react'

import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Select,
  Textarea
} from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'

import { useThemeColor } from 'hooks/useThemeColors'

import { TbSignature, TbSignatureOff } from 'react-icons/tb'

const SigningModal = ({
  isOpen,
  onClose,
  sbomData,
  status,
  setStatus,
  signedData,
  setSignedData
}) => {
  const [algorithm, setAlgorithm] = useState('')
  const [certificate, setCertificate] = useState('')
  const [spdxSign, setSpdxSign] = useState('')
  const [cycloneDxSign, setCycloneDxSign] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (signedData) {
      setAlgorithm(signedData.algorithm)
      setCertificate(signedData.certificate)
      setSpdxSign(signedData.spdxSign)
      setCycloneDxSign(signedData.cycloneDxSign)
    }
  }, [signedData])

  const { lightAndDarkBgColor, primaryBlueText } = useThemeColor([
    'lightAndDarkBgColor',
    'primaryBlueText'
  ])

  // const [sbomSign] = useMutation(signSbom)

  const handleSave = (e) => {
    e.preventDefault()
    if (status === 'signed') {
      setMessage(
        `This action will unsign the SBOM. You’ll need to sign the SBOM to disable edit. Do you wish to continue with unsigning the SBOM?`
      )
    } else {
      setMessage(
        `This action will sign the SBOM and make it read-only. You’ll need to unsign the SBOM to edit it again. Do you wish to continue with signing the SBOM?`
      )
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (status === 'signed') {
      setStatus('created')
      setSignedData(null)
      onClose()
    } else {
      setStatus('signed')
      setSignedData({
        algorithm,
        certificate,
        spdxSign,
        cycloneDxSign
      })
      onClose()
    }
  }

  return (
    <>
      <LynkModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={message === '' ? handleSave : handleSubmit}
        title={`${sbomData.lifecycle === 'signed' ? 'Unsign' : 'Sign'} SBOM`}
        Icon={sbomData.lifecycle === 'signed' ? TbSignatureOff : TbSignature}
        buttonText={
          message === ''
            ? status === 'signed'
              ? 'Unsign'
              : 'Validate and Sign'
            : 'Yes'
        }
      >
        <Flex width={'100%'} direction={'column'} gap={4}>
          <Box
            bg={primaryBlueText}
            w='100%'
            p={2}
            color={lightAndDarkBgColor}
            fontWeight='medium'
            fontSize='16px'
            align='center'
            borderRadius='lg'
            boxShadow='md'
          >
            SBOM Signing coming soon...
          </Box>
          {/* Algorithm */}
          <FormControl isRequired>
            <FormLabel>Algorithm</FormLabel>
            <Select
              size='sm'
              id='algorithm'
              name='algorithm'
              value={algorithm}
              disabled={true}
              onChange={(e) => setAlgorithm(e.target.value)}
            >
              <option value=''>-- Select --</option>
              <option value='RS256'>RS256</option>
            </Select>
          </FormControl>
          {algorithm === 'RS256' && (
            <>
              {/* Cerificate */}
              <FormControl isRequired>
                <FormLabel>Cerificate</FormLabel>
                <Textarea
                  rows={8}
                  value={certificate}
                  onChange={(e) => setCertificate(e.target.value)}
                />
              </FormControl>
              {/* CycloneDX Signature */}
              <FormControl isRequired>
                <FormLabel>CycloneDX Signature</FormLabel>
                <Textarea
                  rows={2}
                  value={cycloneDxSign}
                  onChange={(e) => setCycloneDxSign(e.target.value)}
                />
              </FormControl>
              {/* SPDX Signature */}
              <FormControl isRequired>
                <FormLabel>SPDX Signature</FormLabel>
                <Textarea
                  rows={2}
                  value={spdxSign}
                  onChange={(e) => setSpdxSign(e.target.value)}
                />
              </FormControl>
            </>
          )}

          {message !== '' && <LynkAlert status='info' msg={message} />}
        </Flex>
      </LynkModal>
    </>
  )
}

export default SigningModal
