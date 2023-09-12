import { useMutation } from '@apollo/client'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Textarea,
  Select,
  Alert,
  AlertIcon,
  Text
} from '@chakra-ui/react'
import { signSbom } from 'graphQL/Mutation'
import { useState } from 'react'

const SigningModal = ({
  isOpen,
  onClose,
  setStatus,
  sbomId,
  projectId,
  refetch
}) => {
  const [algorithm, setAlgorithm] = useState('')
  const [certificate, setCertificate] = useState('')
  const [signature, setSignature] = useState('')
  const [message, setMessage] = useState('')

  const [sbomSign] = useMutation(signSbom)

  const handleSave = (e) => {
    e.preventDefault()
    setMessage(
      `This action will sign the SBOM and make it read-only. You’ll need to unsign the SBOM to edit it again. Do you wish to continue with signing the SBOM?`
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await sbomSign({
        variables: {
          sbomID: sbomId,
          sig: signature,
          sigType: algorithm,
          pubKey: certificate
        }
      })
        .then(() => {
          refetch({
            projectId: projectId,
            sbomId: sbomId
          })
        })
        .finally(() => onClose())
    } catch (error) {
      console.log(`Something went wrong `, error)
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <form onSubmit={message === '' ? handleSave : handleSubmit}>
          <ModalContent>
            <ModalHeader>SBOM Signing</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex width={'100%'} direction={'column'} gap={4}>
                {/* Algorithm */}
                <FormControl isRequired>
                  <FormLabel>Algorithm</FormLabel>
                  <Select
                    id='algorithm'
                    name='algorithm'
                    size='sm'
                    value={algorithm}
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
                        value={certificate}
                        onChange={(e) => setCertificate(e.target.value)}
                        fontSize={'sm'}
                        rows={8}
                      />
                    </FormControl>
                    {/* Signature */}
                    <FormControl isRequired>
                      <FormLabel>Signature</FormLabel>
                      <Textarea
                        value={signature}
                        onChange={(e) => setSignature(e.target.value)}
                        fontSize={'sm'}
                        rows={2}
                      />
                    </FormControl>
                  </>
                )}

                {message !== '' && (
                  <Alert status='info'>
                    <AlertIcon />
                    <Text fontSize={'sm'}>{message}</Text>
                  </Alert>
                )}
              </Flex>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme='gray' mr={3} onClick={onClose}>
                Cancel
              </Button>
              {message === '' ? (
                <Button colorScheme='blue' type='submit'>
                  Validate and Sign
                </Button>
              ) : (
                <Button colorScheme='blue' type={'submit'}>
                  Yes
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  )
}

export default SigningModal
