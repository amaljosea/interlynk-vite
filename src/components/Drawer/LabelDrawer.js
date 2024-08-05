import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex
} from '@chakra-ui/react'

import LabelTable from 'components/Tables/LabelTable'

const LabelDrawer = ({ isOpen, onClose }) => {
  return (
    <>
      <Drawer
        size='md'
        isOpen={isOpen}
        placement='right'
        onClose={onClose}
        closeOnOverlayClick={false}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton mt={2} />
          <DrawerHeader borderBottomWidth='1px'>Edit Label</DrawerHeader>
          <DrawerBody mt={2} px={0} as={Flex} flexDirection={'column'} gap={4}>
            <LabelTable />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default LabelDrawer
