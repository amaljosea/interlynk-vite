import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { WarningIcon } from '@chakra-ui/icons'
import {
  Box,
  Flex,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text
} from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'

import { UserEmailConfirmation } from 'graphQL/Mutation'

const Confirmation = () => {
  const { showToast } = useCustomToast()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const token = queryParams.get('confirmation_token')

  const [error, setError] = useState([])

  const [emailConfirmation] = useMutation(UserEmailConfirmation)

  useEffect(() => {
    emailConfirmation({
      variables: {
        token
      }
    }).then((res) => {
      if (res?.data?.userEmailConfirmation?.errors.length > 0) {
        setError(res?.data?.userEmailConfirmation?.errors[0])
      } else {
        setError([])
        showToast({
          description: 'Registration Successful 👍',
          status: 'success'
        })
      }
    })
  }, [emailConfirmation, showToast, token])

  if (error?.length > 0) {
    return (
      <Modal isCentered size={'3xl'} isOpen={true}>
        <ModalOverlay bg='blackAlpha.300' backdropFilter='blur(4px)' />
        <ModalContent>
          <ModalBody py={12}>
            {error.length > 0 && (
              <Box
                textAlign={'center'}
                as={Flex}
                alignItems={'center'}
                justifyContent={'center'}
                flexDir={'column'}
              >
                <Icon color={'red.400'} boxSize={20} as={WarningIcon} />
                <Text my={6}>{error[0]}</Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  }

  return <Navigate to={'/auth'} />
}

export default Confirmation
