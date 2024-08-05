import GraphView from 'views/Sbom/components/GraphView'

import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Text
} from '@chakra-ui/react'

import CompInfo from 'components/Misc/CompInfo'

const GraphDrawer = ({ isOpen, onClose, primaryComp, activeComp }) => {
  return (
    <Drawer isOpen={isOpen} placement='right' size='lg' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={3} />
        <DrawerHeader borderBottomWidth='1px'>
          <Text fontWeight={'medium'}>Relationships</Text>
          {activeComp && <CompInfo data={activeComp} />}
        </DrawerHeader>
        <DrawerBody pr={3}>
          <GraphView data={primaryComp} activeComp={activeComp} />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default GraphDrawer
