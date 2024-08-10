import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons'
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
import useQueryParam from 'hooks/useQueryParam'

import { AcceptInvitation, DeclineInvitation } from 'graphQL/Mutation'
import { OrgUserInvitationInfo } from 'graphQL/Queries'

const Invitation = () => {
  const { showToast } = useCustomToast()
  const navigate = useNavigate()
  const token = useQueryParam('token')
  const nonce = useQueryParam('nonce')

  const [error, setError] = useState([])
  const [isRejected, setIsRejected] = useState(false)

  const [acceptInvitation] = useMutation(AcceptInvitation)
  const [rejectInvitation] = useMutation(DeclineInvitation)

  const { data, loading } = useQuery(OrgUserInvitationInfo, {
    skip: !token,
    variables: { token, nonce }
  })

  const { organizationName } = data?.organizationUserInvitationInfo || ''

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
          navigate(
            `/register?id=${res.data.organizationUserInvitationAccept.user.email}`
          )
        } else if (
          res.data.organizationUserInvitationAccept.userType === 'existing_user'
        ) {
          showToast({
            description: 'Registration Successful 👍',
            status: 'success'
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
        setIsRejected(true)
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
                  That did not work because of the following error:
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
    <Modal isCentered size={'3xl'} isOpen={loading ? false : true}>
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
            <Icon
              color={isRejected ? 'red.400' : 'green.500'}
              boxSize={20}
              as={isRejected ? WarningIcon : CheckCircleIcon}
            />
            <Text my={6} fontSize={20}>
              {isRejected
                ? 'Invitation Rejected'
                : `This is an invitation to join ${organizationName || ''}`}
            </Text>
            {!isRejected && (
              <HStack spacing={2}>
                <Button variant='outline' colorScheme='blue' onClick={onReject}>
                  Decline
                </Button>

                <Button variant='solid' colorScheme='blue' onClick={onAccept}>
                  Accept
                </Button>
              </HStack>
            )}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default Invitation
