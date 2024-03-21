import { Drawer, DrawerBody, DrawerOverlay, DrawerContent, DrawerCloseButton } from '@chakra-ui/react'
import GraphView from 'views/Sbom/components/GraphView'

const GraphDrawer = ({ isOpen, onClose, primaryComp, activeComp }) => {
  return (
    <Drawer isOpen={isOpen} placement='bottom' size='lg' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerBody mt={12}><GraphView data={primaryComp} activeComp={activeComp} /></DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default GraphDrawer
