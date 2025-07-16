import { useQuery } from '@apollo/client'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { truncatedValue } from 'utils'
import SBOM from 'views/Customer/Sbom'

import { Flex, Grid, GridItem, Icon, Skeleton, Text } from '@chakra-ui/react'
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import EnvFilter from 'components/Misc/EnvFilter'
import VersionsTable from 'components/Tables/VersionsTable'

import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { ShareLynkProjectGroup } from 'graphQL/Queries'

import { LuBox, LuLock } from 'react-icons/lu'

const tabs = [
  'versions',
  'vulnerabilities',
  'automation rules',
  'settings',
  'policies',
  'change log'
]

const ProductDetails = () => {
  const params = useParams()
  const productGroupId = params.productgroupid
  const sbomId = params.sbomid

  const { secondaryBlueText, secondaryTextInverse } = useThemeColor([
    'secondaryBlueText',
    'secondaryTextInverse'
  ])

  const { dispatch } = useGlobalState()

  const { prodVulnDispatch } = dispatch

  const { data, loading, error } = useQuery(ShareLynkProjectGroup, {
    skip: sbomId,
    variables: {
      id: productGroupId
    }
  })

  const { projectGroup } = data?.shareLynkQuery || {}
  const { name, description } = projectGroup || {}

  useEffect(() => {
    if (!sbomId) {
      prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    }
  }, [prodVulnDispatch, sbomId])

  if (loading) {
    return (
      <Card>
        <Flex width={'100%'} gap={4} direction={'row'}>
          <Skeleton width={'100%'} height='30px' />
          <Skeleton width={'100%'} height='30px' />
        </Flex>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <Text textAlign={'center'}>Something went wrong</Text>
      </Card>
    )
  }

  if (sbomId) {
    return <SBOM />
  }

  return (
    <Flex flexDirection={'column'} alignItems={'flex-start'} gap={6}>
      {/* INFO SECTION */}
      <Card display={data ? 'block' : 'none'} className='product_details'>
        <CardBody>
          <Grid
            width={'100%'}
            templateColumns='repeat(12, 1fr)'
            alignItems={'top'}
            gap={10}
          >
            {/* PRODUCT INFORMATIONS */}
            <GridItem colSpan={10}>
              <Flex
                gap={5}
                width={'100%'}
                direction={'row'}
                alignItems={'flex-start'}
              >
                <Icon
                  h={'64px'}
                  w={'64px'}
                  color={secondaryBlueText}
                  as={LuBox}
                />
                <Flex gap={0.5} direction={'column'}>
                  {/* PRODUCT TITLE */}
                  <Text
                    fontWeight={'semibold'}
                    wordBreak={'break-all'}
                    fontSize={22}
                  >
                    {truncatedValue(name, 30) || ''}
                  </Text>
                  {/* PRODUCT DESCRIPTION */}
                  <Text fontSize={'sm'} wordBreak={'break-all'}>
                    {description || ''}
                  </Text>
                </Flex>
              </Flex>
            </GridItem>
            {/* PRODUCT ACTIONS */}
            <GridItem colSpan={2} ml={'auto'}>
              <EnvFilter data={projectGroup} />
            </GridItem>
          </Grid>
        </CardBody>
      </Card>
      {/* TAB SECTION */}
      <Card display={data ? 'block' : 'none'}>
        <CardBody>
          <Tabs variant='enclosed' w={'100%'}>
            <TabList>
              {tabs.map((item, index) => (
                <Tab
                  key={index}
                  _focus={{ outline: 'none' }}
                  textTransform={'capitalize'}
                  isDisabled={item !== 'versions'}
                >
                  {item !== 'versions' && (
                    <LuLock
                      size={18}
                      color={secondaryTextInverse}
                      style={{ marginRight: '6px' }}
                    />
                  )}
                  {item}
                </Tab>
              ))}
            </TabList>
            <TabPanels>
              {/* VERSIONS */}
              <TabPanel px={0}>
                <VersionsTable />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
    </Flex>
  )
}

export default ProductDetails
