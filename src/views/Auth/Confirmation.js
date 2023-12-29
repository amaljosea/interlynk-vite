import { useEffect, useState } from 'react'
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
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { WarningIcon } from '@chakra-ui/icons'
import { useMutation } from '@apollo/client'
import { UserEmailConfirmation } from 'graphQL/Mutation'

const Confirmation = () => {
  const navigate = useNavigate()
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
      console.log(res.data)
      if (res.data.userEmailConfirmation.errors.length > 0) {
        setError(res.data.organizationUserInvitationAccept.errors)
      } else {
        setError([])
      }
    })
  }, [])

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
