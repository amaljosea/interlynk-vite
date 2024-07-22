import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SBOM from 'views/Customer/Sbom'

import {
  Flex,
  Grid,
  GridItem,
  Icon,
  Skeleton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import VersionsTable from 'components/Tables/VersionsTable'

import { useGlobalState } from 'hooks/useGlobalState'

import { ShareLynkProjectGroup, ShareVulnData } from 'graphQL/Queries'

import { FaLock, FaWindowMaximize } from 'react-icons/fa6'

const ProductDetails = () => {
  const params = useParams()
  const productId = params.productid
  const productGroupId = params.productgroupid
  const sbomId = params.sbomid
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const [activeEnv, setActiveEnv] = useState(productId || '')

  const tabs = [
    'versions',
    'vulnerabilities',
    'automation rules',
    'settings',
    'policies',
    'change log'
  ]

  const {
    totalRows,
    activeCsProdTab,
    setActiveCsProdTab,
    prodVulnState,
    dispatch,
    envName
  } = useGlobalState()

  const environment = envName

  const {
    field,
    direction,
    searchInput,
    severities,
    components,
    statues,
    include,
    kev,
    epss,
    direct
  } = prodVulnState
  const { prodVulnDispatch } = dispatch

  const { data, refetch, loading, error } = useQuery(ShareLynkProjectGroup, {
    skip: sbomId,
    variables: {
      id: productGroupId
    }
  })

  const { projectGroup } = data?.shareLynkQuery || ''
  const { name, description } = projectGroup || ''

  const handleTabChange = (value) => {
    localStorage.setItem('activeCsProdTab', value)
    setActiveCsProdTab(value)
  }

  const vulnEpss = (epss !== 'all' || epss !== '') && epss?.split('-')

  const range = {
    min: parseFloat(vulnEpss[0]) / 100,
    max: parseFloat(vulnEpss[1]) / 100
  }

  // GET VULN DATA
  const { data: vulnData, refetch: vulnRefetch } = useQuery(ShareVulnData, {
    skip: sbomId ? false : true,
    variables: {
      projectId: signedUrlParams ? undefined : productId || activeEnv,
      sbomId: sbomId,
      first: totalRows,
      last: undefined,
      after: undefined,
      before: undefined,
      search: searchInput !== '' ? searchInput : undefined,
      severity: severities.length > 0 ? severities : undefined,
      source: include.includes('parts') ? undefined : 'COMPONENT',
      includeRetracted: include.includes('retracted') ? true : false,
      componentName: components.length > 0 ? components : undefined,
      status: statues.length > 0 ? statues : undefined,
      kev:
        kev === 'all' || kev === '' ? undefined : kev === 'yes' ? true : false,
      epss: epss !== '' && epss !== 'all' ? range : undefined,
      direct: direct === true ? true : undefined,
      field,
      direction
    }
  })

  const [versionFilters, setVersionFilters] = useState({
    field: 'SBOMS_CREATED_AT',
    direction: 'DESC'
  })

  useEffect(() => {
    if (sbomId === null) {
      prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    }
  }, [prodVulnDispatch, sbomId])

  useEffect(() => {
    if (environment && data) {
      const env = data?.shareLynkQuery?.projectGroup?.projects.find(
        (item) => item.name === environment
      )
      setActiveEnv(env?.id)
    }
  }, [data, environment])

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
    return (
      <SBOM
        prodRefetch={refetch}
        vulnData={vulnData}
        getVulnData={vulnRefetch}
      />
    )
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
                  color='blue.300'
                  as={FaWindowMaximize}
                />
                <Flex gap={0.5} direction={'column'}>
                  {/* PRODUCT TITLE */}
                  <Text fontWeight={'semibold'} fontSize={25}>
                    {name || ''}
                  </Text>
                  {/* PRODUCT DESCRIPTION */}
                  <Text fontSize={'sm'}>{description || ''}</Text>
                </Flex>
              </Flex>
            </GridItem>
            {/* PRODUCT ACTIONS */}
            <GridItem colSpan={2}></GridItem>
          </Grid>
        </CardBody>
      </Card>
      {/* TAB SECTION */}
      <Card display={data ? 'block' : 'none'}>
        <CardBody>
          <Tabs
            variant='enclosed'
            w={'100%'}
            index={activeCsProdTab}
            onChange={(value) => handleTabChange(value)}
          >
            <TabList>
              {tabs.map((item, index) => (
                <Tab
                  key={index}
                  _focus={{ outline: 'none' }}
                  textTransform={'capitalize'}
                  isDisabled={item === 'versions' ? false : true}
                >
                  {item !== 'versions' && (
                    <FaLock color='darkgray' style={{ marginRight: '6px' }} />
                  )}
                  {item}
                </Tab>
              ))}
            </TabList>
            <TabPanels>
              {/* VERSIONS */}
              <TabPanel px={0}>
                <VersionsTable
                  retentionTime={null}
                  filters={versionFilters}
                  projectGroup={projectGroup}
                  setFilters={setVersionFilters}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
    </Flex>
  )
}

export default ProductDetails
