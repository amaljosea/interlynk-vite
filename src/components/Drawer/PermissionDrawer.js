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
  Text
} from '@chakra-ui/react'
import { permissionList } from 'utils'

const PermissionDrawer = ({ isOpen, onClose, data }) => {
  const { permissionsMap } = data

  return (
    <Drawer isOpen={isOpen} placement='right' size='md' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Permissions for {data?.name || ''}</DrawerHeader>

        <DrawerBody>
          <Stack spacing={2.5} direction={'column'} alignItems={'flex-start'}>
            {permissionList(permissionsMap).length > 0 &&
              permissionList(permissionsMap).map((item) => (
                <Box
                  width={'full'}
                  key={item.key}
                  py={2}
                  borderBottom={'1px solid #E2E8F0'}
                >
                  <Text fontWeight={'medium'} mb={1}>
                    {item.category}
                  </Text>
                  <Checkbox defaultChecked={item.value} isReadOnly>
                    {item.name}
                  </Checkbox>
                  <Stack pl={6} mt={1} spacing={1}>
                    {item?.supersededBy?.length > 0 &&
                      item?.supersededBy.map(({ value, name }, index) => (
                        <Checkbox
                          key={index}
                          defaultChecked={value}
                          color={'blackAlpha.800'}
                          isReadOnly
                        >
                          {name}
                        </Checkbox>
                      ))}
                  </Stack>
                </Box>
              ))}
          </Stack>
        </DrawerBody>

        <DrawerFooter>
          <Button onClick={onClose}>Close</Button>
          {/* <Button colorScheme='blue'>Save</Button> */}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default PermissionDrawer
