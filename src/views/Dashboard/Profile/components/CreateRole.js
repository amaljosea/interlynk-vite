import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'

import {
  Alert,
  AlertIcon,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text
} from '@chakra-ui/react'

import LynkSelect from 'components/LynkSelect'

import { OrgRoleCreate } from 'graphQL/Mutation'
import { GetAllPermissions } from 'graphQL/Queries'

const CreateRole = ({ isOpen, onClose, refetch }) => {
  const [roleName, setRoleName] = useState('')
  const [permissions, setPermissions] = useState('')
  const [disabled, setDisabled] = useState(false)
  const [error, setError] = useState('')

  const [createRole] = useMutation(OrgRoleCreate)

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

  const disableButtonTemporarily = () => {
    setDisabled(true)
    setTimeout(() => {
      setDisabled(false)
    }, 3000)
  }

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
      disableButtonTemporarily()
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
          refetch()
          onClose()
        }
      })
    }
  }

  const isInvalid =
    roleName === '' || permissions?.length === 0 || error !== '' || disabled

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      motionPreset='slideInBottom'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Role</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack direction={'column'} alignItems={'flex-start'} spacing={4}>
            {error !== '' && (
              <Alert status='error' borderRadius={4}>
                <AlertIcon />
                <Text fontSize={'sm'}>{error}</Text>
              </Alert>
            )}
            {/* NAME */}
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input type='text' value={roleName} onChange={onNameChange} />
            </FormControl>
            {/* PERMISSIONS */}
            <FormControl isRequired>
              <FormLabel>Copy Permission From</FormLabel>
              <LynkSelect
                value={permissions}
                options={psOptions}
                placeholder='Select'
                onChange={onPermissionChange}
                components={{
                  DropdownIndicator: () => null,
                  IndicatorSeparator: () => null
                }}
              />
            </FormControl>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant='solid'
            onClick={onSave}
            colorScheme='blue'
            isDisabled={isInvalid}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CreateRole
