import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'

import { Box, Checkbox, Divider, Stack, Tag } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import LynkAlert from 'components/LynkAlert'
import LynkDrawer from 'components/LynkDrawer'

import useCustomToast from 'hooks/useCustomToast'
import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'

import { UpdateOrganizationRole } from 'graphQL/Mutation'
import { GetAllPermissions } from 'graphQL/Queries'

const PERMISSION_CATEGORIES = [
  'Organization Management',
  'Product Management',
  'SBOM Management',
  'Support Level Management',
  'User Management',
  'Vulnerability Management',
  'License Management',
  'Policy Management',
  'Support Management',
  'Vendor Management',
  'Connection Management'
]

const PermissionDrawer = ({ isOpen, onClose, selectedRole }) => {
  const { showToast } = useCustomToast()
  const activetab = useQueryParam('tab')

  const updateOrg = useHasPermission({
    parentKey: 'view_organization',
    childKey: 'update_organization'
  })

  const [updateRole] = useMutation(UpdateOrganizationRole)

  const [error, setError] = useState('')
  const { data, loading } = useQuery(GetAllPermissions, {
    skip: activetab === 'roles' ? false : true
  })
  const organizationRoles = data?.organization?.organizationRoles || []

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
        setError('')
        showToast({
          description: `${filterItem?.name} Permission updated successfully`,
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
          .map((item) => (
            <Checkbox isDisabled key={item.key} isChecked={item.value}>
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
    <LynkDrawer
      title={`Permissions for ${activeRole?.name || ''}`}
      isOpen={isOpen}
      onClose={onClose}
      noFooter
    >
      {loading ? (
        <CustomLoader />
      ) : (
        <Stack spacing={6} mt={2} dir='column'>
          {readOnly && (
            <Tag width={'fit-content'} colorScheme='red'>
              {activeRole?.name} permissions cannot be modified
            </Tag>
          )}
          {error !== '' && <LynkAlert msg={error} />}
          <Stack spacing={4} dir='blue'>
            {PERMISSION_CATEGORIES.map((category) => (
              <Stack spacing={4} key={category}>
                <Permissions category={category} />
                <Divider />
              </Stack>
            ))}
          </Stack>
        </Stack>
      )}
    </LynkDrawer>
  )
}

export default PermissionDrawer
