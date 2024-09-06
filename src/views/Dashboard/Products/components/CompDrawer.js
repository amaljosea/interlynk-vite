import { useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
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
  const tabs = ['details', 'identifiers', 'suppliers', 'links', 'relationships']

  const { tabData, resetData, unsavedChanges, saveChanges } =
    useContext(TabContext)

  const [tab, setTab] = useState(0)
  const [pendingTabIndex, setPendingTabIndex] = useState(null)
  const [isWarningOpen, setIsWarningOpen] = useState(false)
  const cancelRef = useRef()

  const { sbomId: bomId } = data || ''
  const isPart = sbomId !== bomId

  const { data: comPath } = useQuery(GetComponentPath, {
    skip: isOpen ? false : true,
    variables: { compId: data?.id, sbomId: isPart ? bomId : sbomId }
  })

  const onTabChange = (index) => {
    const componentTabs = Object.keys(tabData).map(
      (key) => key.charAt(0) + key.slice(1)
    )
    const currentTab = componentTabs[Number(tab)]
    if (unsavedChanges[currentTab]) {
      setPendingTabIndex(index)
      setIsWarningOpen(true)
    } else {
      setTab(index)
    }
  }

  const confirmTabSwitch = () => {
    setIsWarningOpen(false)
    setTab(pendingTabIndex)
    setPendingTabIndex(null)
  }

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
          <DrawerCloseButton mt={3} onClick={resetData} />
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

      {/* Warning dialog for unsaved changes */}
      <AlertDialog
        isOpen={isWarningOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsWarningOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Unsaved Changes
            </AlertDialogHeader>

            <AlertDialogBody>
              You have unsaved changes. Are you sure you want to switch tabs
              without saving?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsWarningOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme='red' onClick={confirmTabSwitch} ml={3}>
                Switch Tabs
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}

export default CompDrawer
