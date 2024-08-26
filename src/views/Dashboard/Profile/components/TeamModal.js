import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import { validateEmail } from 'utils'

import {
  Alert,
  AlertIcon,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
  Stack,
  Text
} from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'

import { InviteUser } from 'graphQL/Mutation'
import { GetRoles } from 'graphQL/Queries'

import { BiUserPlus } from 'react-icons/bi'

const TeamModal = ({ isOpen, onClose, data, changeRole }) => {
  const { showToast } = useCustomToast()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState(data?.role?.id)
  const [error, setError] = useState('')

  const { data: roles } = useQuery(GetRoles)

  const [inviteUsers] = useMutation(InviteUser)

  const handleAdd = async () => {
    try {
      await inviteUsers({
        variables: {
          email: email.toLowerCase(),
          roleId: role || undefined
        }
      }).then((res) => {
        if (res.data.organizationUserInvite.errors.length > 0) {
          setError(res.data.organizationUserInvite.errors[0])
        } else {
          showToast({
            description: 'Invitation sent successfully',
            status: 'success'
          })
          onClose()
        }
      })
    } catch (error) {
      console.log(`Error`, error)
    }
  }

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleAdd}
      title={'Invite User'}
      Icon={BiUserPlus}
      disabled={!validateEmail(email) || role === ''}
      buttonText='Add'
    >
      <Stack direction={'column'} alignItems={'flex-start'} spacing={4}>
        {error !== '' && (
          <Alert status='error' borderRadius={4}>
            <AlertIcon />
            <Text fontSize={'sm'}>{error}</Text>
          </Alert>
        )}
        {/* EMAIL */}
        <FormControl
          isRequired
          isInvalid={email !== '' && !validateEmail(email)}
        >
          <FormLabel>Email</FormLabel>
          <Input
            type='text'
            value={email}
            textTransform={'lowercase'}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
          />
          {email !== '' && !validateEmail(email) && (
            <FormErrorMessage>Email is invalid</FormErrorMessage>
          )}
        </FormControl>
        {/* ROLES */}
        {roles && (
          <FormControl isDisabled={!changeRole}>
            <FormLabel>Role</FormLabel>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              textTransform='capitalize'
            >
              <option value=''>-- Select --</option>
              {roles?.organization?.organizationRoles.map((item, index) => (
                <option key={index} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>
    </LynkModal>
  )
}

export default TeamModal
