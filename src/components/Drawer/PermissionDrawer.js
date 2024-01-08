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
  Checkbox
} from '@chakra-ui/react'

const PermissionDrawer = ({ isOpen, onClose, data }) => {
  const { permissionsMap } = data
  return (
    <Drawer isOpen={isOpen} placement='right' size='md' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>{data?.name || ''}</DrawerHeader>

        <DrawerBody>
          <Stack spacing={2.5} direction={'column'} alignItems={'flex-start'}>
            {permissionsMap &&
              permissionsMap.length > 0 &&
              permissionsMap.map((item) => (
                <Checkbox defaultChecked={item.value}>{item.key}</Checkbox>
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
