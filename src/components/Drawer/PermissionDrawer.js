import { useMutation } from '@apollo/client'
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  Stack,
  Checkbox,
  Box,
  Divider
} from '@chakra-ui/react'
import { UpdateOrganizationRole } from 'graphQL/Mutation'
import { useState } from 'react'

const PermissionDrawer = ({ isOpen, onClose, data, refetch, role }) => {
  const { permissionsMap } = data

  const [permissions, setPermissions] = useState(permissionsMap)

  const [updateRole] = useMutation(UpdateOrganizationRole, {
    onCompleted: () => refetch()
  })

  const orgManagement = permissions?.filter(
    (item) => item.category === 'Organization Management'
  )
  const groupManagement = permissions?.filter(
    (item) => item.category === 'Product Management'
  )
  const prodManagement = permissions?.filter(
    (item) => item.category === 'Product Environment Management'
  )
  const sbomManagement = permissions?.filter(
    (item) => item.category === 'SBOM Management'
  )
  const userManagement = permissions?.filter(
    (item) => item.category === 'User Management'
  )
  const vulnManagement = permissions?.filter(
    (item) => item.category === 'Vulnerability Management'
  )

  // ORGANIZATION MANAGEMENT
  const [checkedOrgManage, setCheckedOrgManage] = useState(
    orgManagement
      ?.filter((item) => item.supersededBy.length === 0)
      .map((item) => item.value)
  )
  const allOrgManageChecked = checkedOrgManage.every(Boolean)
  const isOrgManageChecked =
    checkedOrgManage.some(Boolean) && !allOrgManageChecked
  // PRODUCT GROUP MANAGEMENT
  const [checkedGroupManage, setCheckedGroupManage] = useState(
    groupManagement
      ?.filter((item) => item.supersededBy.length === 0)
      .map((item) => item.value)
  )
  const allGroupManageChecked = checkedGroupManage.every(Boolean)
  const isGroupManageChecked =
    checkedGroupManage.some(Boolean) && !allGroupManageChecked
  // PRODUCT MANAGEMENT
  const [checkedProdManage, setCheckedProdManage] = useState(
    prodManagement
      ?.filter((item) => item.supersededBy.length === 0)
      .map((item) => item.value)
  )
  const allProdManageChecked = checkedProdManage.every(Boolean)
  const isProdManageChecked =
    checkedProdManage.some(Boolean) && !allProdManageChecked
  // SBOM MANAGEMENT
  const [checkedSbomManage, setCheckedSbomManage] = useState(
    sbomManagement
      ?.filter((item) => item.supersededBy.length === 0)
      .map((item) => item.value)
  )
  const allSbomManageChecked = checkedSbomManage.every(Boolean)
  const isSbomManageChecked =
    checkedSbomManage.some(Boolean) && !allSbomManageChecked
  // USER MANAGEMENT
  const [checkedUserManage, setCheckedUserManage] = useState(
    userManagement
      ?.filter((item) => item.supersededBy.length === 0)
      .map((item) => item.value)
  )
  const allUserManageChecked = checkedUserManage.every(Boolean)
  const isUserManageChecked =
    checkedUserManage.some(Boolean) && !allUserManageChecked
  // VULN MANAGEMENT
  const [checkedVulnManage, setCheckedVulnManage] = useState(
    vulnManagement
      ?.filter((item) => item.supersededBy.length === 0)
      .map((item) => item.value)
  )
  const allVulnManageChecked = checkedVulnManage.every(Boolean)
  const isVulnManageChecked =
    checkedVulnManage.some(Boolean) && !allVulnManageChecked

  const onCheckParent = async (e, category, list) => {
    if (role !== 'custom') {
      const filterData = list
        .filter((item) => item?.supersededBy?.length === 0)
        .map((_) => e.target.checked)
      if (filterData) {
        if (category === 'Organization Management') {
          setCheckedOrgManage(filterData)
        } else if (category === 'Product Management') {
          setCheckedGroupManage(filterData)
        } else if (category === 'Product Environment Management') {
          setCheckedProdManage(filterData)
        } else if (category === 'SBOM Management') {
          setCheckedSbomManage(filterData)
        } else if (category === 'User Management') {
          setCheckedUserManage(filterData)
        } else {
          setCheckedVulnManage(filterData)
        }
        const permissions = list.map((item) => ({
          permissionKey: item?.key,
          value: e.target.checked
        }))
        await updateRole({
          variables: { organizationRoleId: data?.id, permissions: permissions }
        }).then((res) => {
          if (res?.data) {
            setPermissions(
              res?.data?.organizationRoleUpdate?.organizationRole
                ?.permissionsMap
            )
          }
        })
      }
    }
    return null
  }

  const onCheckChild = async (e, category, index, roles) => {
    if (role !== 'custom') {
      const selector = permissions.filter((item) => item.category === category)
      const updatedCheckedItems = [...roles]
      updatedCheckedItems[index] = e.target.checked
      if (category === 'Organization Management') {
        setCheckedOrgManage(updatedCheckedItems)
      } else if (category === 'Product Management') {
        setCheckedGroupManage(updatedCheckedItems)
      } else if (category === 'Product Environment Management') {
        setCheckedProdManage(updatedCheckedItems)
      } else if (category === 'SBOM Management') {
        setCheckedSbomManage(updatedCheckedItems)
      } else if (category === 'User Management') {
        setCheckedUserManage(updatedCheckedItems)
      } else {
        setCheckedVulnManage(updatedCheckedItems)
      }
      const filterItem = selector.find((item) => item?.key === e.target.name)
      const active = selector.some(
        (item) =>
          item?.supersededBy?.length === 0 &&
          item?.key !== e.target.name &&
          item?.value === true
      )
      await updateRole({
        variables: {
          organizationRoleId: data?.id,
          permissions: [
            {
              permissionKey: selector[0]?.key,
              value: !active && e.target.checked === false ? false : true
            },
            { permissionKey: filterItem?.key, value: e.target.checked }
          ]
        }
      }).then((res) => {
        if (res?.data) {
          setPermissions(
            res?.data?.organizationRoleUpdate?.organizationRole?.permissionsMap
          )
        }
      })
    }
    return null
  }

  const readOnly = data?.name !== 'custom' && role !== 'admin'

  return (
    <Drawer isOpen={isOpen} placement='right' size='md' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Permissions for {data?.name || ''}</DrawerHeader>
        <DrawerBody>
          <Stack spacing={4} dir='column'>
            {/* ORGANIZATION MANAGEMENT */}
            <Box>
              {orgManagement
                ?.filter((item) => item.supersededBy.length > 0)
                .map((item, index) => (
                  <Checkbox
                    key={index}
                    isChecked={allOrgManageChecked}
                    isIndeterminate={isOrgManageChecked}
                    isReadOnly={readOnly}
                    onChange={(e) =>
                      onCheckParent(e, item.category, orgManagement)
                    }
                  >
                    {item.name}
                  </Checkbox>
                ))}
              <Stack pl={6} mt={1} spacing={1}>
                {orgManagement
                  ?.filter((item) => item.supersededBy.length === 0)
                  .map((item, index) => (
                    <Checkbox
                      key={index}
                      name={item.key}
                      isChecked={checkedOrgManage[index]}
                      isReadOnly={readOnly}
                      onChange={(e) =>
                        onCheckChild(e, item.category, index, checkedOrgManage)
                      }
                    >
                      {item.name}
                    </Checkbox>
                  ))}
              </Stack>
            </Box>
            <Divider />
            {/* PROJECT GROUP MANAGEMENT */}
            <Box mt={6}>
              {groupManagement
                ?.filter((item) => item.supersededBy.length > 0)
                .map((item, index) => (
                  <Checkbox
                    key={index}
                    isChecked={allGroupManageChecked}
                    isIndeterminate={isGroupManageChecked}
                    isReadOnly={readOnly}
                    onChange={(e) =>
                      onCheckParent(e, item.category, groupManagement)
                    }
                  >
                    {item.name}
                  </Checkbox>
                ))}
              <Stack pl={6} mt={1} spacing={1}>
                {groupManagement
                  ?.filter((item) => item.supersededBy.length === 0)
                  .map((item, index) => (
                    <Checkbox
                      key={index}
                      name={item.key}
                      isChecked={checkedGroupManage[index]}
                      isReadOnly={readOnly}
                      onChange={(e) =>
                        onCheckChild(
                          e,
                          item.category,
                          index,
                          checkedGroupManage
                        )
                      }
                    >
                      {item.name}
                    </Checkbox>
                  ))}
              </Stack>
            </Box>
            <Divider />
            {/* PROJECT MANAGEMENT */}
            <Box mt={6}>
              {prodManagement
                ?.filter((item) => item.supersededBy.length > 0)
                .map((item, index) => (
                  <Checkbox
                    key={index}
                    isChecked={allProdManageChecked}
                    isIndeterminate={isProdManageChecked}
                    isReadOnly={readOnly}
                    onChange={(e) =>
                      onCheckParent(e, item.category, prodManagement)
                    }
                  >
                    {item.name}
                  </Checkbox>
                ))}
              <Stack pl={6} mt={1} spacing={1}>
                {prodManagement
                  ?.filter((item) => item.supersededBy.length === 0)
                  .map((item, index) => (
                    <Checkbox
                      key={index}
                      name={item.key}
                      isChecked={checkedProdManage[index]}
                      isReadOnly={readOnly}
                      onChange={(e) =>
                        onCheckChild(e, item.category, index, checkedProdManage)
                      }
                    >
                      {item.name}
                    </Checkbox>
                  ))}
              </Stack>
            </Box>
            <Divider />
            {/* SBOM MANAGEMENT */}
            <Box mt={6}>
              {sbomManagement
                ?.filter((item) => item.supersededBy.length > 0)
                .map((item, index) => (
                  <Checkbox
                    key={index}
                    isChecked={allSbomManageChecked}
                    isIndeterminate={isSbomManageChecked}
                    isReadOnly={readOnly}
                    onChange={(e) =>
                      onCheckParent(e, item.category, sbomManagement)
                    }
                  >
                    {item.name}
                  </Checkbox>
                ))}
              <Stack pl={6} mt={1} spacing={1}>
                {sbomManagement
                  ?.filter((item) => item.supersededBy.length === 0)
                  .map((item, index) => (
                    <Checkbox
                      key={index}
                      name={item.key}
                      isChecked={checkedSbomManage[index]}
                      isReadOnly={readOnly}
                      onChange={(e) =>
                        onCheckChild(e, item.category, index, checkedSbomManage)
                      }
                    >
                      {item.name}
                    </Checkbox>
                  ))}
              </Stack>
            </Box>
            <Divider />
            {/* USER MANAGEMENT */}
            <Box mt={6}>
              {userManagement
                ?.filter((item) => item.supersededBy.length > 0)
                .map((item, index) => (
                  <Checkbox
                    key={index}
                    isChecked={allUserManageChecked}
                    isIndeterminate={isUserManageChecked}
                    isReadOnly={readOnly}
                    onChange={(e) =>
                      onCheckParent(e, item.category, userManagement)
                    }
                  >
                    {item.name}
                  </Checkbox>
                ))}
              <Stack pl={6} mt={1} spacing={1}>
                {userManagement
                  ?.filter((item) => item.supersededBy.length === 0)
                  .map((item, index) => (
                    <Checkbox
                      key={index}
                      name={item.key}
                      isChecked={checkedUserManage[index]}
                      isReadOnly={readOnly}
                      onChange={(e) =>
                        onCheckChild(e, item.category, index, checkedUserManage)
                      }
                    >
                      {item.name}
                    </Checkbox>
                  ))}
              </Stack>
            </Box>
            <Divider />
            {/* VULN MANAGEMENT */}
            <Box mt={6}>
              {vulnManagement
                ?.filter((item) => item.supersededBy.length > 0)
                .map((item, index) => (
                  <Checkbox
                    key={index}
                    isChecked={allVulnManageChecked}
                    isIndeterminate={isVulnManageChecked}
                    isReadOnly={readOnly}
                    onChange={(e) =>
                      onCheckParent(e, item.category, vulnManagement)
                    }
                  >
                    {item.name}
                  </Checkbox>
                ))}
              <Stack pl={6} mt={1} spacing={1}>
                {vulnManagement
                  ?.filter((item) => item.supersededBy.length === 0)
                  .map((item, index) => (
                    <Checkbox
                      key={index}
                      name={item.key}
                      isChecked={checkedVulnManage[index]}
                      isReadOnly={readOnly}
                      onChange={(e) =>
                        onCheckChild(e, item.category, index, checkedVulnManage)
                      }
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
