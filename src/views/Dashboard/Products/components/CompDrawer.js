import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Text,
  useColorModeValue
} from '@chakra-ui/react'

import CompDetails from './CompDetails'
import CompIdentifiers from './CompIdentifiers'
import CompLinks from './CompLinks'
import CompSupplier from './CompSupplier'

const CompInfo = ({ data }) => {
  const { name, version } = data || ''

  return (
    <Flex width={'90%'} columnGap={2} flexWrap={'wrap'} alignContent={'center'}>
      <Text fontSize='sm' fontWeight={'medium'} wordBreak={'break-all'}>
        {name}
      </Text>
      <Tag size='sm' colorScheme='blue'>
        {version}
      </Tag>
    </Flex>
  )
}

const CompDrawer = ({ isOpen, onClose, data, refetch }) => {
  const bgColor = useColorModeValue('white', 'gray.700')
  const tabs = ['details', 'identifiers', 'suppliers', 'links']

  return (
    <Drawer size='md' isOpen={isOpen} placement='right' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={3} />
        <DrawerHeader borderBottomWidth='1px'>
          {data ? 'Edit' : 'Add'} Component
          {data && <CompInfo data={data} />}
        </DrawerHeader>
        <DrawerBody>
          <Tabs>
            <TabList
              position={'fixed'}
              top={'84px'}
              bg={bgColor}
              zIndex={111}
              left={5}
              right={5}
            >
              {tabs.map((item, index) => (
                <Tab
                  key={index}
                  textTransform={'capitalize'}
                  _focus={{ outline: 'none' }}
                >
                  {item}
                </Tab>
              ))}
            </TabList>
            <TabPanels pos={'relative'} top={8} overflowX={'hidden'}>
              <TabPanel px={0}>
                <CompDetails data={data} onClose={onClose} refetch={refetch} />
              </TabPanel>
              <TabPanel>
                <CompIdentifiers
                  data={data}
                  onClose={onClose}
                  refetch={refetch}
                />
              </TabPanel>
              <TabPanel>
                <CompSupplier data={data} onClose={onClose} refetch={refetch} />
              </TabPanel>
              <TabPanel>
                <CompLinks
                  component={data}
                  onClose={onClose}
                  refetch={refetch}
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
