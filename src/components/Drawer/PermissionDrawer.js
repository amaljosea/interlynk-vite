import { useMutation, useQuery } from '@apollo/client'
import { useLocation } from 'react-router-dom'

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
  Stack
} from '@chakra-ui/react'

import { UpdateOrganizationRole } from 'graphQL/Mutation'
import { GetAllPermissions } from 'graphQL/Queries'

const PermissionDrawer = ({ isOpen, onClose, selectedRole, userRole }) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const activetab = queryParams.get('tab')

  const { data, refetch } = useQuery(GetAllPermissions, {
    skip: activetab === 'roles' ? false : true
  })
  const [updateRole] = useMutation(UpdateOrganizationRole, {
    onCompleted: () => refetch()
  })

  const activeRole =
    data &&
    data?.organization?.organizationRoles?.find(
      (item) => item?.name === selectedRole
    )

  const onCheckParent = async (e, category) => {
    if (userRole !== 'custom') {
      const list = activeRole?.permissionsMap?.filter(
        (item) => item.category === category && item.hidden === null
      )
      const filterData = list
        .filter((item) => item?.supersededBy?.length === 0)
        .map((_) => e.target.checked)
      if (filterData) {
        const permissions = list.map((item) => ({
          permissionKey: item?.key,
          value: e.target.checked
        }))
        await updateRole({
          variables: {
            organizationRoleId: activeRole?.id,
            permissions: permissions
          }
        })
      }
    }
    return null
  }

  const onCheckChild = async (e, category) => {
    if (userRole !== 'custom') {
      const selector = activeRole?.permissionsMap?.filter(
        (item) => item.category === category
      )
      const filterItem = selector?.find((item) => item?.key === e.target.name)
      await updateRole({
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

  const readOnly = activeRole?.name !== 'custom' && userRole !== 'admin'

  return (
    <Drawer isOpen={isOpen} placement='right' size='md' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Permissions for {activeRole?.name || ''}</DrawerHeader>
        <DrawerBody>
          <Stack spacing={4} dir='column'>
            {/* ORGANIZATION MANAGEMENT */}
            <Box>
              {activeRole?.permissionsMap
                ?.filter(
                  (item) =>
                    item.category === 'Organization Management' &&
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
                      item.category === 'Organization Management' &&
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
            <Divider />
            {/* PROJECT GROUP MANAGEMENT */}
            <Box mt={6}>
              {activeRole?.permissionsMap
                ?.filter(
                  (item) =>
                    item.category === 'Product Management' &&
                    item.hidden === null &&
                    item.supersededBy.length > 0
                )
                .map((item, index) => (
                  <Checkbox
                    key={index}
                    isChecked={item?.value}
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
                      item.category === 'Product Management' &&
                      item.hidden === null &&
                      item.supersededBy.length === 0
                  )
                  .map((item, index) => (
                    <Checkbox
                      key={index}
                      name={item.key}
                      isChecked={item.value}
                      isReadOnly={readOnly}
                      onChange={(e) => onCheckChild(e, item.category)}
                    >
                      {item.name}
                    </Checkbox>
                  ))}
              </Stack>
            </Box>
            <Divider />
            {/* PROJECT MANAGEMENT */}
            <Box mt={6}>
              {activeRole?.permissionsMap
                ?.filter(
                  (item) =>
                    item.category === 'Product Environment Management' &&
                    item.hidden === null &&
                    item.supersededBy.length > 0
                )
                .map((item, index) => (
                  <Checkbox
                    key={index}
                    isChecked={item?.value}
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
                      item.category === 'Product Environment Management' &&
                      item.hidden === null &&
                      item.supersededBy.length === 0
                  )
                  .map((item, index) => (
                    <Checkbox
                      key={index}
                      name={item.key}
                      isChecked={item.value}
                      isReadOnly={readOnly}
                      onChange={(e) => onCheckChild(e, item.category)}
                    >
                      {item.name}
                    </Checkbox>
                  ))}
              </Stack>
            </Box>
            <Divider />
            {/* SBOM MANAGEMENT */}
            <Box mt={6}>
              {activeRole?.permissionsMap
                ?.filter(
                  (item) =>
                    item.category === 'SBOM Management' &&
                    item.hidden === null &&
                    item.supersededBy.length > 0
                )
                .map((item, index) => (
                  <Checkbox
                    key={index}
                    isChecked={item?.value}
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
                      item.category === 'SBOM Management' &&
                      item.hidden === null &&
                      item.supersededBy.length === 0
                  )
                  .map((item, index) => (
                    <Checkbox
                      key={index}
                      name={item.key}
                      isChecked={item.value}
                      isReadOnly={readOnly}
                      onChange={(e) => onCheckChild(e, item.category)}
                    >
                      {item.name}
                    </Checkbox>
                  ))}
              </Stack>
            </Box>
            <Divider />
            {/* USER MANAGEMENT */}
            <Box mt={6}>
              {activeRole?.permissionsMap
                ?.filter(
                  (item) =>
                    item.category === 'User Management' &&
                    item.hidden === null &&
                    item.supersededBy.length > 0
                )
                .map((item, index) => (
                  <Checkbox
                    key={index}
                    isChecked={item?.value}
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
                      item.category === 'User Management' &&
                      item.hidden === null &&
                      item.supersededBy.length === 0
                  )
                  .map((item, index) => (
                    <Checkbox
                      key={index}
                      name={item.key}
                      isChecked={item.value}
                      isReadOnly={readOnly}
                      onChange={(e) => onCheckChild(e, item.category)}
                    >
                      {item.name}
                    </Checkbox>
                  ))}
              </Stack>
            </Box>
            <Divider />
            {/* VULN MANAGEMENT */}
            <Box mt={6}>
              {activeRole?.permissionsMap
                ?.filter(
                  (item) =>
                    item.category === 'Vulnerability Management' &&
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
                      item.category === 'Vulnerability Management' &&
                      item.hidden === null &&
                      item.supersededBy.length === 0
                  )
                  .map((item, index) => (
                    <Checkbox
                      key={index}
                      name={item.key}
                      isChecked={item.value}
                      isReadOnly={readOnly}
                      onChange={(e) => onCheckChild(e, item.category)}
                    >
                      {item.name}
                    </Checkbox>
                  ))}
              </Stack>
            </Box>
            <Divider />
            {/* LICENSE MANAGEMENT */}
            <Box mt={6}>
              {activeRole?.permissionsMap
                ?.filter(
                  (item) =>
                    item.category === 'License Management' &&
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
                      item.category === 'License Management' &&
                      item.hidden === null &&
                      item.supersededBy.length === 0
                  )
                  .map((item, index) => (
                    <Checkbox
                      key={index}
                      name={item.key}
                      isChecked={item.value}
                      isReadOnly={readOnly}
                      onChange={(e) => onCheckChild(e, item.category)}
                    >
                      {item.name}
                    </Checkbox>
                  ))}
              </Stack>
            </Box>
          </Stack>
        </DrawerBody>

        <DrawerFooter>
          <Button onClick={onClose}>Close</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default PermissionDrawer
