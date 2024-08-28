import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import ReactSelect from 'react-select'

import {
  Alert,
  AlertIcon,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text
} from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import { useSelect } from 'hooks/useSelect'

import { OrgRoleCreate } from 'graphQL/Mutation'
import { GetAllPermissions } from 'graphQL/Queries'

import { BiUserPlus } from 'react-icons/bi'

const CreateRole = ({ isOpen, onClose }) => {
  const [roleName, setRoleName] = useState('')
  const [permissions, setPermissions] = useState('')
  const [error, setError] = useState('')

  const [createRole, { loading }] = useMutation(OrgRoleCreate)

  const { style } = useSelect('field')

  const psOptions = []

  const { data } = useQuery(GetAllPermissions, {
    skip: isOpen === true ? false : true
  })

  const { organizationRoles } = data?.organization || ''

  organizationRoles?.length &&
    organizationRoles?.map((item) => {
      const allPs = item?.permissionsMap
        ?.filter((ps) => ps?.value === true)
        ?.map((item) => item?.key)
      psOptions?.push({ value: allPs, label: item?.name })
    })

  const onNameChange = (e) => {
    setRoleName(e.target.value)
    setError('')
  }

  const onPermissionChange = (value) => {
    setPermissions(value)
    setError('')
  }

  const onSave = () => {
    if (roleName?.length < 4) {
      setError('Input must be at least 4 characters')
    } else {
      createRole({
        variables: {
          name: roleName,
          permissions: permissions?.value
        }
      }).then((res) => {
        const { errors } = res?.data?.organizationRoleCreate || ''
        if (errors?.length > 0) {
          setError(errors[0])
        } else {
          onClose()
        }
      })
    }
  }

  const isInvalid = roleName === '' || permissions?.length === 0 || error !== ''

  return (
    <LynkModal
      isOpen={isOpen}
      buttonText='Save'
      onClose={onClose}
      onSubmit={onSave}
      Icon={BiUserPlus}
      title={'Add Role'}
      isLoading={loading}
      disabled={isInvalid}
    >
      <Stack direction={'column'} alignItems={'flex-start'} spacing={4}>
        {error !== '' && (
          <Alert status='error' borderRadius={4}>
            <AlertIcon />
            <Text fontSize={'sm'}>{error}</Text>
          </Alert>
        )}
        {/* NAME */}
        <FormControl isRequired>
          <FormLabel fontSize={12}>Name</FormLabel>
          <Input type='text' value={roleName} onChange={onNameChange} />
        </FormControl>
        {/* PERMISSIONS */}
        <FormControl isRequired>
          <FormLabel fontSize={12}>Copy Permission From</FormLabel>
          <ReactSelect
            styles={style}
            className='react-select'
            value={permissions}
            options={psOptions}
            placeholder='Select'
            onChange={onPermissionChange}
            components={{
              IndicatorSeparator: () => null
            }}
          />
        </FormControl>
      </Stack>
    </LynkModal>
  )
}

export default CreateRole
