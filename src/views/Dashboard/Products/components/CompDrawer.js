import { useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext } from 'react'
import { useParams } from 'react-router-dom'
import { isCustomerView } from 'utils'
import { getSignedUrlParams } from 'utils'

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

const CompDrawer = ({ isOpen, onClose, data, primaryComp }) => {
  const params = useParams()
  const sbomId = params.sbomid
  const bgColor = useColorModeValue('white', 'gray.700')
  const customerView = isCustomerView()
  const signedUrlParams = getSignedUrlParams()

  const tabs = customerView
    ? ['details', 'identifiers']
    : ['details', 'identifiers', 'suppliers', 'links', 'relationships']

  const { resetData, tab, onTabChange } = useContext(TabContext)

  const { sbomId: bomId } = data || ''
  const isPart = sbomId !== bomId

  const { data: comPath } = useQuery(GetComponentPath, {
    skip: isOpen && !customerView ? false : true,
    variables: { compId: data?.id, sbomId: isPart ? bomId : sbomId }
  })

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
        <DrawerCloseButton mt={3} onClick={resetData} />
        <DrawerHeader borderBottomWidth='1px'>
          <Text mb={1} fontWeight={'medium'}>
            {signedUrlParams ? 'Component' : 'Edit Component'}
          </Text>
          {data && <CompInfo data={data} />}
        </DrawerHeader>
        <DrawerBody p={0}>
          <Tabs isFitted index={tab} onChange={onTabChange}>
            <TabList
              position={'fixed'}
              bg={bgColor}
              zIndex={11}
              left={0}
              right={0}
            >
              {tabs.map((item, index) => (
                <Tab
                  py={3.5}
                  key={index}
                  fontSize={'sm'}
                  textTransform={'capitalize'}
                  _focus={{ outline: 'none', bg: 'none' }}
                >
                  {item}
                </Tab>
              ))}
            </TabList>
            <TabPanels pos={'relative'} top={12} overflowX={'hidden'}>
              <TabPanel px={0}>
                <CompDetails data={data} primaryComp={primaryComp} />
              </TabPanel>
              <TabPanel px={0}>
                <CompIdentifiers data={data} />
              </TabPanel>
              <TabPanel px={0}>
                <CompSupplier data={data} />
              </TabPanel>
              <TabPanel px={0}>
                <CompLinks data={data} />
              </TabPanel>
              <TabPanel px={0}>
                <CompRelations
                  data={data}
                  compPath={comPath?.component?.pathToPrimary}
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
