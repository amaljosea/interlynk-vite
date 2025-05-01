import { useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { PackageURL } from 'packageurl-js'
import { useContext } from 'react'
import { useParams } from 'react-router-dom'
import { getSignedUrlParams } from 'utils'

import { Box, Flex, Text, Tooltip } from '@chakra-ui/react'
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'

import LynkDrawer from 'components/LynkDrawer'
import CompInfo from 'components/Misc/CompInfo'

import { useRouteFlags } from 'hooks/useRouteFlags'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetComponentPath } from 'graphQL/Queries'


import CompDetails from './CompDetails'
import CompIdentifiers from './CompIdentifiers'
import CompLinks from './CompLinks'
import CompRelations from './CompRelations'
import CompSupplier from './CompSupplier'
import { LuMessageCircleWarning } from 'react-icons/lu'

const Warning = ({ type }) => {
  const label = `The component version does not match the ${type === 'purl' ? 'PURL' : 'CPE'} version under Identifiers`
  return (
    <Tooltip label={label}>
      <Box>
        <LuMessageCircleWarning size={20} color={'orange'} />
      </Box>
    </Tooltip>
  )
}

const CompDrawer = ({ isOpen, onClose, data, primaryComp }) => {
  const params = useParams()
  const sbomId = params.sbomid
  const { secondaryBgColor } = useThemeColor(['secondaryBgColor'])
  const { isCustomerView } = useRouteFlags()
  const signedUrlParams = getSignedUrlParams()

  const tabs = isCustomerView
    ? ['Details', 'Identifiers']
    : ['Details', 'Identifiers', 'Suppliers', 'Links', 'Relationships']

  const { resetData, tabData, onTabChange } = useContext(TabContext)
  const { purl, cpe } = tabData?.identifiers || {}

  const { sbomId: bomId } = data || ''
  const isPart = sbomId !== bomId

  const { data: comPath } = useQuery(GetComponentPath, {
    skip: isOpen && !isCustomerView ? false : true,
    variables: { compId: data?.id, sbomId: isPart ? bomId : sbomId }
  })

  const getPurlVersion = (value) => {
    try {
      const pkg = PackageURL.fromString(value)
      return pkg?.version || null
    } catch (error) {
      console.warn('Something went wrong', error)
    }
  }

  const purlVersion = purl !== '' ? getPurlVersion(purl) : null
  const purlWarning = purlVersion && data?.version !== purlVersion

  const cpeString = cpe !== '' ? cpe?.split(':') : null
  const cpeVersion = cpeString ? cpeString[5]?.replace(/\*/g, '') : null
  const cpeWarning = cpeVersion && data?.version !== cpeVersion

  const onCloseDrawer = () => {
    resetData()
    onClose()
  }

  return (
    <LynkDrawer
      title={
        <Flex alignItems='center' gap={2}>
          <Text fontWeight={'medium'}>
            {signedUrlParams ? 'Component' : 'Edit Component'}
          </Text>
          {purlWarning && <Warning type={'purl'} />}
          {cpeWarning && <Warning type={'cpe'} />}
        </Flex>
      }
      subtitle={data && <CompInfo data={data} />}
      isOpen={isOpen}
      onClose={onCloseDrawer}
      noFooter
    >
      <Tabs px={0} isFitted onChange={onTabChange}>
        <TabList
          position={'fixed'}
          bg={secondaryBgColor}
          zIndex={11}
          left={0}
          right={0}
          top={!data ? '60px' : '90px'}
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
              {item?.replace('_', ' ')}
            </Tab>
          ))}
        </TabList>
        <TabPanels pos={'relative'} top={12} overflowX={'hidden'} p={0}>
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
    </LynkDrawer>
  )
}

export default CompDrawer
