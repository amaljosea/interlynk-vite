import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearData } from 'utils/authUtils'

import { WarningIcon } from '@chakra-ui/icons'
import { Button, Flex, Icon, Stack, Text } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'

import useCustomToast from 'hooks/useCustomToast'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { AcceptInvitation, DeclineInvitation } from 'graphQL/Mutation'
import { OrgUserInvitationInfo } from 'graphQL/Queries'

import { FaTimesCircle } from 'react-icons/fa'

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

  const { primaryErrorColor, sameSecondaryText } = useThemeColor([
    'primaryErrorColor',
    'sameSecondaryText'
  ])

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
        clearData()
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

  if (loading) return <CustomLoader />

  if (error?.length > 0) {
    return (
      <Flex
        flexDir={'column'}
        textAlign={'center'}
        alignItems={'center'}
        justifyContent={'center'}
      >
        <Icon color={primaryErrorColor} boxSize={20} as={WarningIcon} />
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
      </Flex>
    )
  }

  return (
    <Flex
      gap={2}
      width={'100%'}
      flexDir={'column'}
      alignItems={'center'}
      justifyContent={'center'}
    >
      {isRejected && (
        <Icon
          mb={6}
          color={primaryErrorColor}
          boxSize={16}
          as={FaTimesCircle}
        />
      )}
      <Text fontSize={'20px'} fontWeight={'semibold'}>
        {isRejected
          ? 'Invitation Rejected'
          : `Invitation to join ${organizationName}`}
      </Text>
      <Text fontSize={'sm'} textAlign={'center'} color={sameSecondaryText}>
        {isRejected
          ? `You have declined an invitation to join ${organizationName}`
          : `You are invited to join ${organizationName} at Interlynk`}
      </Text>
      {!isRejected && (
        <Stack mt={8} spacing={4} w={'full'}>
          <Button
            w={'100%'}
            variant='solid'
            colorScheme='blue'
            onClick={onAccept}
            title='Accept invitation'
          >
            Accept Invitation
          </Button>
          <Button
            title='Decline'
            variant='ghost'
            colorScheme='blue'
            onClick={onReject}
          >
            Decline
          </Button>
        </Stack>
      )}
    </Flex>
  )
}

export default Invitation
