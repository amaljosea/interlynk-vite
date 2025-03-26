import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { formatString } from 'utils'

import { FormControl, FormLabel, Input, Stack } from '@chakra-ui/react'

import { ChangeRoleIcon } from 'components/Icons/Icons'
import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'
import LynkSelect from 'components/LynkSelect'

import { UpdateOrganizationUserRole } from 'graphQL/Mutation'
import { GetRoles } from 'graphQL/Queries'

const RoleModal = ({ isOpen, onClose, data }) => {
  const [role, setRole] = useState(data?.role?.id)
  const [error, setError] = useState('')

  const { data: roles } = useQuery(GetRoles, { skip: isOpen ? false : true })

  const [updateOrgRules, { loading }] = useMutation(UpdateOrganizationUserRole)

  const updateRole = async () => {
    await updateOrgRules({
      variables: {
        userId: data?.id,
        organizationRoleId: role
      }
    }).then((res) => {
      if (res?.data?.organizationUserUpdate?.errors.length > 0) {
        setError(res?.data?.organizationUserUpdate?.errors[0])
      } else {
        onClose()
      }
    })
  }

  useEffect(() => {
    if (data) {
      setRole(data?.role?.id)
    }
  }, [data])

  const roleOptions =
    roles?.organization?.organizationRoles?.map((item) => ({
      value: item.id,
      label: formatString(item.name)
    })) || []

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={updateRole}
      title={'Change Role'}
      Icon={ChangeRoleIcon}
      disabled={role === ''}
      buttonText='Update'
      isLoading={loading}
    >
      <Stack direction={'column'} alignItems={'flex-start'} spacing={4}>
        {error !== '' && <LynkAlert msg={error} />}
        {/* NAME */}
        <FormControl hidden={!data?.name}>
          <FormLabel>Name</FormLabel>
          <Input type='text' defaultValue={data?.name || ''} disabled />
        </FormControl>
        {/* ROLES */}
        {roles && (
          <FormControl>
            <FormLabel>Role</FormLabel>
            <LynkSelect
              name='role'
              value={
                roleOptions.find((option) => option.value === role) || null
              }
              onChange={(selectedOption) =>
                setRole(selectedOption?.value || '')
              }
              options={roleOptions}
              placeholder='-- Select --'
              dropDown
            />
          </FormControl>
        )}
      </Stack>
    </LynkModal>
  )
}

export default RoleModal
