import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'

import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Checkbox,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Stack,
  Tag,
  useToast
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'

import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'

import { UpdateOrganizationRole } from 'graphQL/Mutation'
import { GetAllPermissions } from 'graphQL/Queries'

const PermissionDrawer = ({ isOpen, onClose, selectedRole }) => {
  const toast = useToast()
  const activetab = useQueryParam('tab')

  const updateOrg = useHasPermission({
    parentKey: 'view_organization',
    childKey: 'update_organization'
  })

  const [updateRole] = useMutation(UpdateOrganizationRole)

  const [error, setError] = useState('')
  const { data, loading, refetch } = useQuery(GetAllPermissions, {
    skip: activetab === 'roles' ? false : true
  })
  const { organizationRoles } = data?.organization || ''

  const activeRole = organizationRoles?.find(
    (item) => item?.name === selectedRole
  )

  const onCheckChild = (e, category) => {
    e.preventDefault()
    const selector = activeRole?.permissionsMap?.filter(
      (item) => item.category === category
    )
    const filterItem = selector?.find((item) => item?.key === e.target.name)
    updateRole({
      variables: {
        organizationRoleId: activeRole?.id,
        permissions: [
          { permissionKey: filterItem?.key, value: e.target.checked }
        ]
      }
    }).then((res) => {
      const { errors } = res?.data?.organizationRoleUpdate || ''
      if (errors?.length > 0) {
        setError(errors[0])
      } else {
        refetch()
        toast({
          description: `${filterItem?.name} Permission updated successfully`,
          position: 'top',
          status: 'success'
        })
      }
    })
  }

  const restrictedRoles = ['admin', 'viewer', 'operator']

  const readOnly = restrictedRoles?.includes(activeRole?.name?.toLowerCase())

  const Permissions = ({ category }) => {
    return (
      <Box>
        {activeRole?.permissionsMap
          ?.filter(
            (item) =>
              item.category === category &&
              item.hidden === null &&
              item.supersededBy.length > 0
          )
          .map((item, index) => (
            <Checkbox isDisabled key={index} isChecked={item.value}>
              {item.name}
            </Checkbox>
          ))}
        <Stack pl={6} mt={1} spacing={1}>
          {activeRole?.permissionsMap
            ?.filter(
              (item) =>
                item.category === category &&
                item.hidden === null &&
                item.supersededBy.length === 0
            )
            .map((item, index) => (
              <Checkbox
                key={index}
                name={item.key}
                isChecked={item?.value}
                isDisabled={readOnly || !updateOrg}
                onChange={(e) => onCheckChild(e, item.category)}
              >
                {item.name}
              </Checkbox>
            ))}
        </Stack>
      </Box>
    )
  }

  return (
    <Drawer
      isOpen={isOpen}
      placement='right'
      size='md'
      onClose={onClose}
      closeOnOverlayClick={false}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Permissions for {activeRole?.name || ''}</DrawerHeader>
        <DrawerBody>
          {loading ? (
            <CustomLoader />
          ) : (
            <Stack spacing={6} dir='column'>
              {readOnly && (
                <Tag width={'fit-content'} colorScheme='red'>
                  {activeRole?.name} permissions cannot be modified
                </Tag>
              )}
              {error !== '' && (
                <Alert status='error' borderRadius={4}>
                  <AlertIcon />
                  <AlertDescription fontSize={'sm'}>{error}</AlertDescription>
                </Alert>
              )}
              <Stack spacing={4} dir='blue'>
                {/* ORGANIZATION MANAGEMENT */}
                <Permissions category={'Organization Management'} />
                <Divider />
                {/* PROJECT GROUP MANAGEMENT */}
                <Permissions category={'Product Management'} />
                <Divider />
                {/* PROJECT MANAGEMENT */}
                <Permissions category={'Product Environment Management'} />
                <Divider />
                {/* SBOM MANAGEMENT */}
                <Permissions category={'SBOM Management'} />
                <Divider />
                {/* USER MANAGEMENT */}
                <Permissions category={'User Management'} />
                <Divider />
                {/* VULN MANAGEMENT */}
                <Permissions category={'Vulnerability Management'} />
                <Divider />
                {/* LICENSE MANAGEMENT */}
                <Permissions category={'License Management'} />
                <Divider />
                {/* POLICY MANAGEMENT */}
                <Permissions category={'Policy Management'} />
                <Divider />
                {/* SUPPORT MANAGEMENT */}
                <Permissions category={'Support Management'} />
                <Divider />
                {/* VENDOR MANAGEMENT */}
                <Permissions category={'Vendor Management'} />
                <Divider />
                {/* CONNECTION MANAGEMENT */}
                <Permissions category={'Connection Management'} />
                <Divider />
              </Stack>
            </Stack>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default PermissionDrawer
