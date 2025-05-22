import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { CheckCircleIcon, CloseIcon } from '@chakra-ui/icons'
import { Button, Flex, Icon, Stack, Text } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import FileUpload from 'components/FileUpload'

import useCustomToast from 'hooks/useCustomToast'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import {
  RequestDecline,
  RequestUploadSbom,
  RequestValidate
} from 'graphQL/Mutation'

const SbomUpload = () => {
  const [uploadSuccessView, setAUploadSuccessView] = useState(false)
  const [uploadFailureView, setUploadFailureView] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [requestData, setRequestData] = useState(null)

  const navigate = useNavigate()

  const {
    primaryTextColor,
    secondaryTextColor,
    primaryBlueText,
    primarySuccessColor,
    primaryErrorColor
  } = useThemeColor([
    'primaryTextColor',
    'secondaryTextColor',
    'primaryBlueText',
    'primarySuccessColor',
    'primaryErrorColor'
  ])
  const { showToast } = useCustomToast()
  const token = useQueryParam('token')
  const id = useQueryParam('id')

  const [declineRequest] = useMutation(RequestDecline)
  const [uploadSbom, { error, loading }] = useMutation(RequestUploadSbom)
  const [validateRequest, { loading: vrLoading }] = useMutation(RequestValidate)

  useEffect(() => {
    validateRequest({ variables: { id, token } }).then((res) => {
      if (res.data?.requestValidate?.errors?.length > 0) {
        showToast({
          description: res.data?.requestValidate.errors[0],
          status: 'error'
        })
        setUploadFailureView(true)
      } else {
        setRequestData(res.data?.requestValidate?.request)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token, validateRequest])

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
        setUploadFailureView(true)
      }
    })
  }

  const handleUploadRequestSbom = async (file) => {
    await uploadSbom({ variables: { file: file, id: id, token: token } }).then(
      (res) => {
        if (res?.data?.requestUploadSbom.errors?.length > 0) {
          showToast({
            title: 'SBOM upload failed',
            description: res?.data?.requestUploadSbom.errors[0],
            status: 'error'
          })
        } else {
          showToast({
            title: 'SBOM uploaded successfully',
            description: 'This SBOM will be sent to the requester shortly.',
            status: 'success'
          })
          setAUploadSuccessView(true)
        }
      }
    )
  }

  if (vrLoading) return <CustomLoader />

  return (
    <Flex alignItems='center' justifyContent='center'>
      {!uploadSuccessView && !uploadFailureView && (
        <Flex alignItems='center' justifyContent='center'>
          <Stack w={'100%'} textAlign='center' gap={'20px'}>
            <Stack>
              <Text
                fontSize='20px'
                fontWeight='600'
                textColor={primaryTextColor}
              >
                Upload SBOM
              </Text>
              <Text
                fontSize='14px'
                fontWeight='400'
                textColor={secondaryTextColor}
              >
                {requestData?.requester?.name} at{' '}
                {requestData?.organization?.name} has requested an SBOM
                {requestData?.productName || requestData?.productVersion
                  ? ' for'
                  : ''}
                {requestData?.productName && (
                  <> Product - {requestData.productName}</>
                )}
                {requestData?.productName &&
                  requestData?.productVersion &&
                  ' and'}
                {requestData?.productVersion && (
                  <> Version - {requestData.productVersion}</>
                )}
                .
              </Text>
            </Stack>
            <Stack minHeight='165px'>
              <FileUpload
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                isLoading={loading}
                error={error}
                errorMessage={errorMessage}
                setErrorMessage={setErrorMessage}
              />
            </Stack>

            <Stack>
              <Button
                title='Upload SBOM'
                isDisabled={
                  selectedFile === null || errorMessage !== '' || loading
                }
                onClick={() => handleUploadRequestSbom(selectedFile)}
                colorScheme={'blue'}
              >
                Upload
              </Button>
              <Button
                title='Decline SBOM upload'
                onClick={() => {
                  onDecline()
                }}
                colorScheme={'white'}
                textColor={primaryBlueText}
              >
                Decline
              </Button>
            </Stack>
          </Stack>
        </Flex>
      )}

      {(uploadSuccessView || uploadFailureView) && (
        <Flex alignItems='center' justifyContent='center'>
          <Stack textAlign='center' gap={'20px'} alignItems='center'>
            <Icon
              as={uploadSuccessView ? CheckCircleIcon : CloseIcon}
              color={uploadSuccessView ? primarySuccessColor : 'white'}
              boxSize='64px'
              bg={uploadSuccessView ? 'white' : primaryErrorColor}
              borderRadius='full'
              padding={uploadFailureView && 2}
            />
            <Stack spacing={1}>
              <Text
                fontSize='20px'
                fontWeight='600'
                textColor={primaryTextColor}
              >
                {uploadSuccessView
                  ? ' Upload Successful'
                  : 'Upload request Declined'}
              </Text>
              <Text
                fontSize='14px'
                fontWeight='400'
                textColor={secondaryTextColor}
              >
                {uploadSuccessView
                  ? 'You may close this window or login to dasboard'
                  : 'You may close this window'}
              </Text>
            </Stack>

            <Stack>
              <Text
                fontSize='12px'
                fontWeight='500'
                textColor={primaryBlueText}
                cursor={'pointer'}
                onClick={() => navigate('/auth')}
              >
                Login to Interlynk
              </Text>
            </Stack>
          </Stack>
        </Flex>
      )}
    </Flex>
  )
}

export default SbomUpload
