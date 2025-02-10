import { useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { PackageURL } from 'packageurl-js'
import { useContext } from 'react'
import { useParams } from 'react-router-dom'
import { getSignedUrlParams, isCustomerView } from 'utils'

import { Box, Flex, Text, Tooltip } from '@chakra-ui/react'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay
} from '@chakra-ui/react'
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'

import CompInfo from 'components/Misc/CompInfo'

import { useThemeColor } from 'hooks/useThemeColors'

import { GetComponentPath } from 'graphQL/Queries'

import { MdWarning } from 'react-icons/md'

import CompDetails from './CompDetails'
import CompIdentifiers from './CompIdentifiers'
import CompLinks from './CompLinks'
import CompRelations from './CompRelations'
import CompSupplier from './CompSupplier'

const Warning = ({ type }) => {
  const label = `The component version does not match the ${type === 'purl' ? 'PURL' : 'CPE'} version under Identifiers`
  return (
    <Tooltip label={label}>
      <Box>
        <MdWarning color={'orange'} />
      </Box>
    </Tooltip>
  )
}

const CompDrawer = ({ isOpen, onClose, data, primaryComp }) => {
  const params = useParams()
  const sbomId = params.sbomid
  const { secondaryBgColor } = useThemeColor(['secondaryBgColor'])
  const customerView = isCustomerView()
  const signedUrlParams = getSignedUrlParams()

  const tabs = customerView
    ? ['details', 'identifiers']
    : ['details', 'identifiers', 'suppliers', 'links', 'relationships']

  const { resetData, tab, tabData, onTabChange } = useContext(TabContext)
  const { purl, cpe } = tabData?.identifiers || {}

  const { sbomId: bomId } = data || ''
  const isPart = sbomId !== bomId

  const { data: comPath } = useQuery(GetComponentPath, {
    skip: isOpen && !customerView ? false : true,
    variables: { compId: data?.id, sbomId: isPart ? bomId : sbomId }
  })

  const getPurlVersion = (value) => {
    try {
      const pkg = PackageURL.fromString(value)
      return pkg?.version || null
    } catch (error) {
      console.log('Something went wrong', error)
    }
  }

  const purlVersion = purl !== '' ? getPurlVersion(purl) : null
  const purlWarning = purlVersion && data?.version !== purlVersion

  const cpeString = cpe !== '' ? cpe?.split(':') : null
  const cpeVersion = cpeString ? cpeString[5]?.replace(/\*/g, '') : null
  const cpeWarning = cpeVersion && data?.version !== cpeVersion

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
        <DrawerCloseButton mt={3} onClick={resetData} aria-label='comp_close' />
        <DrawerHeader borderBottomWidth='1px'>
          <Flex gap={2} mb={1} alignItems={'center'}>
            <Text fontWeight={'medium'}>
              {signedUrlParams ? 'Component' : 'Edit Component'}
            </Text>
            {purlWarning && <Warning type={'purl'} />}
            {cpeWarning && <Warning type={'cpe'} />}
          </Flex>
          {data && <CompInfo data={data} />}
        </DrawerHeader>
        <DrawerBody p={0}>
          <Tabs isFitted index={tab} onChange={onTabChange}>
            <TabList
              position={'fixed'}
              bg={secondaryBgColor}
              zIndex={11}
              left={0}
              right={0}
            >
              {tabs.map((item, index) => (
                <Tab
                  py={3.5}
                  key={index}
                  fontSize={'sm'}
                  name={item}
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
