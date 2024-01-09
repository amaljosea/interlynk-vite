import { useState } from 'react'
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
  Text,
  useToast
} from '@chakra-ui/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons'
import { AcceptInvitation } from 'graphQL/Mutation'
import { useMutation } from '@apollo/client'
import { DeclineInvitation } from 'graphQL/Mutation'

const Invitation = () => {
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const token = queryParams.get('token')
  const nonce = queryParams.get('nonce')

  const [error, setError] = useState([])

  const [acceptInvitation] = useMutation(AcceptInvitation)
  const [rejectInvitation] = useMutation(DeclineInvitation)

  const onAccept = async () => {
    await acceptInvitation({
      variables: {
        token,
        nonce
      }
    }).then((res) => {
      if (res.data.organizationUserInvitationAccept.errors.length > 0) {
        setError(res.data.organizationUserInvitationAccept.errors)
      } else {
        setError([])
        if (res.data.organizationUserInvitationAccept.userType === 'new_user') {
          navigate('/register')
        } else if (
          res.data.organizationUserInvitationAccept.userType === 'existing_user'
        ) {
          toast({
            description: 'Registration Successful 👍',
            status: 'success',
            position: 'top',
            duration: 4000
          })
          navigate(
            `/auth?id=${res.data.organizationUserInvitationAccept.user.email}`
          )
        }
      }
    })
  }

  const onReject = async () => {
    await rejectInvitation({
      variables: {
        token,
        nonce
      }
    }).then((res) => {
      if (res.data) {
        console.log(res.data)
        navigate('/auth')
      }
    })
  }

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
                <Text my={6}>
                  That didn't work because of the following error:
                  <br />
                  {error[0]}.
                  <br />
                  <br />
                  This usually happen with a stale or revoked invitation link.
                  <br />
                  Please contact the admin to re-send the link.
                </Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    )
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
            <Icon color={'green.400'} boxSize={20} as={CheckCircleIcon} />
            <Text my={6} fontSize={20}>
              This is an invitation to join Interlynk
            </Text>
            <HStack spacing={2}>
              <Button variant='outline' colorScheme='blue' onClick={onReject}>
                Decline
              </Button>
              <Button variant='solid' colorScheme='blue' onClick={onAccept}>
                Accept
              </Button>
            </HStack>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default Invitation
