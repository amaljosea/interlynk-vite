import { useState } from 'react'
import GraphView from 'views/Sbom/components/GraphView'

import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  IconButton,
  Text
} from '@chakra-ui/react'

import CompInfo from 'components/Misc/CompInfo'

import { FaExpand } from 'react-icons/fa6'

const GraphDrawer = ({ isOpen, onClose, primaryComp, activeComp }) => {
  const [drawerSize, setDrawerSize] = useState('lg')
  const onExpand = () => setDrawerSize((prev) => (prev === 'lg' ? '2xl' : 'lg'))
  const expandStyle = { top: 4, right: 14, pos: 'absolute' }
  return (
    <Drawer isOpen={isOpen} placement='right' size={drawerSize} onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={2} />
        <IconButton size='sm' sx={expandStyle} icon={<FaExpand />} onClick={onExpand} />
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
