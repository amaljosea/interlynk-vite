import { useMutation } from '@apollo/client'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text
} from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'

import {
  RequestDecline,
  RequestUploadSbom,
  RequestValidate
} from 'graphQL/Mutation'

import { FaUpload } from 'react-icons/fa'

const SbomUpload = () => {
  const { showToast } = useCustomToast()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const token = queryParams.get('token')
  const id = queryParams.get('id')

  const [declineRequest] = useMutation(RequestDecline)
  const [uploadSbom] = useMutation(RequestUploadSbom)
  const [validateRequest] = useMutation(RequestValidate)

  const [isUploadVisible, setIsUploadVisible] = useState(true)

  useEffect(() => {
    validateRequest({ variables: { id, token } }).then((res) => {
      if (res.data?.requestValidate?.errors?.length > 0) {
        setIsUploadVisible(false)
        showToast({
          description: res.data?.requestValidate.errors[0],
          status: 'error'
        })
      }
    })
  }, [id, showToast, token, validateRequest])

  const onDecline = () => {
    declineRequest({
      variables: {
        id: id,
        token: token
      }
    }).then((res) => {
      if (res.data?.requestDecline) {
        showToast({
          title: 'Request Declined',
          status: 'success'
        })

        setIsUploadVisible(false)
      }
    })
  }

  const handleUploadRequestSbom = async (file) => {
    await uploadSbom({ variables: { file: file, id: id, token: token } })
      .then((res) => {
        if (res?.data?.requestUploadSbom.errors?.length > 0) {
          showToast({
            description: res?.data?.requestUploadSbom.errors[0],
            status: 'error'
          })
        } else {
          showToast({
            title: 'SBOM uploaded successfully',
            description: 'This SBOM will be sent to the requester shortly.',
            status: 'success'
          })
        }
      })
      .finally(() => setIsUploadVisible(false))
  }

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile) {
      const validExtensions = ['xml', 'json']
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase()
      if (validExtensions.includes(fileExtension)) {
        await handleUploadRequestSbom(selectedFile)
      } else {
        showToast({
          description:
            'Invalid file type, only .xml and .json files are allowed.',
          status: 'error'
        })
      }
    }
  }

  const fileInputRef = useRef(null)

  const handleIconClick = () => {
    fileInputRef.current.click()
  }

  return (
    <Modal isCentered size={'3xl'} isOpen={true}>
      <ModalOverlay bg='blackAlpha.300' backdropFilter='blur(4px)' />
      <ModalContent>
        <ModalBody py={12}>
          <Box
            textAlign={'center'}
            as={Flex}
            alignItems={'center'}
            justifyContent={'center'}
            flexDir={'column'}
          >
            {isUploadVisible ? (
              <>
                <input
                  type='file'
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept='.xml,.json'
                  onChange={handleFileChange}
                />
                <Icon
                  color='blue.400'
                  boxSize={20}
                  as={FaUpload}
                  cursor='pointer'
                  onClick={handleIconClick}
                />
                <Text my={6} fontSize={20}>
                  Click on the above button to upload your SBOM file
                </Text>

                <HStack spacing={2}>
                  <Button
                    variant='outline'
                    colorScheme='red'
                    onClick={onDecline}
                  >
                    Decline
                  </Button>

                  <Button
                    variant='solid'
                    colorScheme='blue'
                    onClick={() => setIsUploadVisible(false)}
                  >
                    Close
                  </Button>
                </HStack>
              </>
            ) : (
              <Text my={6} fontSize={20}>
                You may please close this window
              </Text>
            )}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default SbomUpload
