import { useLazyQuery } from '@apollo/client'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue
} from '@chakra-ui/react'

import CompInfo from 'components/Misc/CompInfo'

import { GetComponentPath } from 'graphQL/Queries'

import CompDetails from './CompDetails'
import CompIdentifiers from './CompIdentifiers'
import CompLinks from './CompLinks'
import CompRelations from './CompRelations'
import CompSupplier from './CompSupplier'

const CompDrawer = ({ isOpen, onClose, data, refetch }) => {
  const params = useParams()
  const sbomId = params.sbomid
  const bgColor = useColorModeValue('white', 'gray.700')
  const tabs = ['details', 'identifiers', 'suppliers', 'links', 'relations']
  const [tab, setTab] = useState(0)

  const [getComPath, { data: comPath, loading: comPathLoading }] =
    useLazyQuery(GetComponentPath)

  const onTabChange = (value) => {
    setTab(value)
    if (value === 4) {
      getComPath({ variables: { compId: data?.id, sbomId: sbomId } })
    }
  }

  return (
    <Drawer
      size='md'
      isOpen={isOpen}
      placement='right'
      onClose={onClose}
      closeOnOverlayClick={false}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={3} />
        <DrawerHeader borderBottomWidth='1px'>
          <Text mb={1} fontWeight={'medium'}>
            {data ? 'Edit' : 'Add'} Component
          </Text>
          {data && <CompInfo data={data} />}
        </DrawerHeader>
        <DrawerBody p={0}>
          <Tabs isFitted index={tab} onChange={onTabChange}>
            <TabList
              position={'fixed'}
              bg={bgColor}
              zIndex={1}
              left={0}
              right={0}
            >
              {tabs.map((item, index) => (
                <Tab
                  key={index}
                  fontSize={'sm'}
                  textTransform={'capitalize'}
                  _focus={{ outline: 'none', bg: 'none' }}
                >
                  {item}
                </Tab>
              ))}
            </TabList>
            <TabPanels pos={'relative'} top={10} overflowX={'hidden'}>
              <TabPanel px={0}>
                <CompDetails data={data} onClose={onClose} refetch={refetch} />
              </TabPanel>
              <TabPanel px={0}>
                <CompIdentifiers
                  data={data}
                  onClose={onClose}
                  refetch={refetch}
                />
              </TabPanel>
              <TabPanel px={0}>
                <CompSupplier data={data} onClose={onClose} refetch={refetch} />
              </TabPanel>
              <TabPanel px={0}>
                <CompLinks
                  component={data}
                  onClose={onClose}
                  refetch={refetch}
                />
              </TabPanel>
              <TabPanel px={0}>
                <CompRelations
                  data={data}
                  onClose={onClose}
                  compPath={comPath?.component?.pathToPrimary}
                  comPathLoading={comPathLoading}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default CompDrawer
