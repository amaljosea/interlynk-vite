import { Drawer, DrawerBody, DrawerOverlay, DrawerContent, DrawerCloseButto } from '@chakra-ui/react'
import GraphView from 'views/Sbom/components/GraphView'

const GraphDrawer = ({ isOpen, onClose, activeComp }) => {
  return (
    <Drawer isOpen={isOpen} placement='bottom' size='lg' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerBody mt={12}><GraphView data={null} activeComp={activeComp} /></DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default GraphDrawer
