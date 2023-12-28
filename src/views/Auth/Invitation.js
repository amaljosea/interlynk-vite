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
import { useLocation, useNavigate } from 'react-router-dom'
import { WarningIcon } from '@chakra-ui/icons'
import { AcceptInvitation } from 'graphQL/Mutation'
import { useMutation } from '@apollo/client'

const Invitation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const token = queryParams.get('token')
  const nonce = queryParams.get('nonce')

  const [error, setError] = useState([])

  const [acceptInvitation] = useMutation(AcceptInvitation)

  useEffect(() => {
    acceptInvitation({
      variables: {
        token,
        nonce
      }
    }).then((res) => {
      if (res.data.organizationUserInvitationAccept.errors.length > 0) {
        setError(res.data.organizationUserInvitationAccept.errors)
      } else {
        console.log(res.data)
        if (res.data.organizationUserInvitationAccept.userType === 'new_user') {
          navigate('/register')
        } else if (
          res.data.organizationUserInvitationAccept.userType === 'existing_user'
        ) {
          navigate('/auth')
        }
      }
    })
  }, [])

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

export default Invitation
