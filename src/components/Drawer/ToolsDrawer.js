import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton
} from '@chakra-ui/react'
import React from 'react'
import Compare from 'views/Dashboard/Tools/Compare'

const ToolsDrawer = ({ data, isOpen, onClose }) => {
  return (
    <Drawer size='2xl' isOpen={isOpen} placement='right' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader mb={4}></DrawerHeader>
        <DrawerBody>
          <Compare selectedSboms={data} />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default ToolsDrawer
