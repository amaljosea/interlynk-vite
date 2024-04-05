import GraphView from 'views/Sbom/components/GraphView'

import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay
} from '@chakra-ui/react'

const GraphDrawer = ({ isOpen, onClose, primaryComp, activeComp }) => {
  return (
    <Drawer isOpen={isOpen} placement='bottom' size='lg' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerBody mt={12}>
          <GraphView data={primaryComp} activeComp={activeComp} />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default GraphDrawer
