import { useMutation, useQuery } from '@apollo/client'

import {
  Box,
  Button,
  Checkbox,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Stack,
  Tag
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'

import useQueryParam from 'hooks/useQueryParam'

import { UpdateOrganizationRole } from 'graphQL/Mutation'
import { GetAllPermissions } from 'graphQL/Queries'

const PermissionDrawer = ({ isOpen, onClose, selectedRole, userRole }) => {
  const activetab = useQueryParam('tab')

  const { data, loading } = useQuery(GetAllPermissions, {
    skip: activetab === 'roles' ? false : true
  })
  const [updateRole] = useMutation(UpdateOrganizationRole)

  const activeRole =
    data &&
    data?.organization?.organizationRoles?.find(
      (item) => item?.name === selectedRole
    )

  const onCheckParent = (e, category) => {
    e.preventDefault()
    if (userRole !== 'custom') {
      const list = activeRole?.permissionsMap?.filter(
        (item) => item.category === category && item.hidden === null
      )
      const filterData = list
        .filter((item) => item?.supersededBy?.length === 0)
        .map(() => e.target.checked)
      if (filterData) {
        const permissions = list.map((item) => ({
          permissionKey: item?.key,
          value: e.target.checked
        }))
        updateRole({
          variables: {
            organizationRoleId: activeRole?.id,
            permissions: permissions
          }
        })
      }
    }
    return null
  }

  const onCheckChild = (e, category) => {
    e.preventDefault()
    if (userRole !== 'custom') {
      const selector = activeRole?.permissionsMap?.filter(
        (item) => item.category === category
      )
      const filterItem = selector?.find((item) => item?.key === e.target.name)
      updateRole({
        variables: {
          organizationRoleId: activeRole?.id,
          permissions: [
            {
              permissionKey: selector[0]?.key,
              value: e.target.checked ? true : selector[0]?.value
            },
            { permissionKey: filterItem?.key, value: e.target.checked }
          ]
        }
      })
    }
    return null
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
            <Checkbox
              key={index}
              isChecked={item.value}
              isReadOnly={readOnly}
              onChange={(e) => onCheckParent(e, item.category)}
            >
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
                isReadOnly={readOnly}
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
    <Drawer isOpen={isOpen} placement='right' size='md' onClose={onClose}>
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
                  Update permissions not allowed
                </Tag>
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
        <DrawerFooter>
          <Button onClick={onClose}>Close</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default PermissionDrawer
