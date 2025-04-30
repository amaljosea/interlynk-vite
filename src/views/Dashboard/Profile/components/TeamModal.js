import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import { formatString } from 'utils'
import { validateEmail } from 'utils/formValidationUtils'

import { Input, Stack } from '@chakra-ui/react'
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'
import LynkSelect from 'components/LynkSelect'

import useCustomToast from 'hooks/useCustomToast'

import { InviteUser } from 'graphQL/Mutation'
import { GetRoles } from 'graphQL/Queries'

import { LuUserPlus } from 'react-icons/lu'

const TeamModal = ({ isOpen, onClose, data, changeRole }) => {
  const { showToast } = useCustomToast()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState(data?.role?.id)
  const [error, setError] = useState('')

  const { data: roles } = useQuery(GetRoles, { skip: isOpen ? false : true })

  const [inviteUsers, { loading }] = useMutation(InviteUser)

  const onChaneEmail = (e) => {
    const value = e.target.value?.trim()
    setEmail(value)
    setError('')
  }

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
      console.warn(`Error`, error)
    }
  }

  const roleOptions = [
    { value: '', label: '-- Select --' },
    ...(roles?.organization?.organizationRoles?.map((item) => ({
      value: item.id,
      label: formatString(item.name)
    })) || [])
  ]

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleAdd}
      title={'Invite User'}
      Icon={LuUserPlus}
      isLoading={loading}
      disabled={!validateEmail(email) || role === ''}
      buttonText='Add'
    >
      <Stack direction={'column'} alignItems={'flex-start'} spacing={4}>
        {error !== '' && <LynkAlert msg={error} />}
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
            onChange={onChaneEmail}
          />
          {email !== '' && !validateEmail(email) && (
            <FormErrorMessage>Email is invalid</FormErrorMessage>
          )}
        </FormControl>
        {/* ROLES */}
        {roles && (
          <FormControl isDisabled={!changeRole}>
            <FormLabel>Role</FormLabel>
            <LynkSelect
              value={roleOptions.find((option) => option.value === role)}
              onChange={(e) => setRole(e.value)}
              options={roleOptions}
              dropDown
            />
          </FormControl>
        )}
      </Stack>
    </LynkModal>
  )
}

export default TeamModal
