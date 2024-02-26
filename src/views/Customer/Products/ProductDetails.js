import {
  Flex,
  Grid,
  GridItem,
  Icon,
  Skeleton,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import { FaLock, FaWindowMaximize } from 'react-icons/fa6'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { ShareLynkProjectGroup } from 'graphQL/Queries'
import { useEffect, useState } from 'react'
import { useGlobalState } from 'hooks/useGlobalState'
import VersionsTable from 'components/Tables/VersionsTable'
import SBOM from 'views/Customer/Sbom'
import { ShareVulnData } from 'graphQL/Queries'

const ProductDetails = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')
  const vulnId = queryParams.get('vulnId')
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')

  const activeProd = localStorage.getItem('publicEnv')
  const group = JSON.stringify(localStorage.getItem('product'))
  const environment = localStorage.getItem('environment')
  const [activeEnv, setActiveEnv] = useState(activeProd || '')

  const {
    totalRows,
    activeCsProdTab,
    setActiveCsProdTab,
    prodVulnState,
    dispatch
  } = useGlobalState()
  const { field, direction, searchInput, severities, components, statues, source, kev, epss, direct } =
    prodVulnState
  const { prodVulnDispatch } = dispatch

  const { data, refetch, loading, error } = useQuery(ShareLynkProjectGroup, {
    skip: sbomId,
    fetchPolicy: 'network-only',
    variables: {
      id: productId
    }
  })

  const handleTabChange = (value) => {
    localStorage.setItem('activeCsProdTab', value)
    setActiveCsProdTab(value)
  }

  const vulnEpss = (epss !== 'all' || epss !== '') && epss?.split('-')

  const range = {
    min: parseFloat(vulnEpss[0]) / 10000,
    max: parseFloat(vulnEpss[1]) / 10000
  }

  // GET VULN DATA
  const { data: vulnData, refetch: vulnRefetch } = useQuery(ShareVulnData, {
    skip: sbomId ? false : true,
    fetchPolicy: 'network-only',
    variables: {
      projectId: signedUrlParams ? undefined : productId || activeEnv,
      sbomId: sbomId,
      first: totalRows,
      last: undefined,
      after: undefined,
      before: undefined,
      search: searchInput !== '' ? searchInput : undefined,
      severity: severities.length > 0 ? severities : undefined,
      source: source === 'BOTH' || source === '' ? undefined : source,
      componentName: components.length > 0 ? components : undefined,
      status: statues.length > 0 ? statues : undefined,
      kev:
        kev === 'all' || kev === '' ? undefined : kev === 'yes' ? true : false,
      epss: epss !== '' && epss !== 'all' ? range : undefined,
      direct: direct === true ? true :  undefined,
      field,
      direction
    }
  })

  useEffect(() => {
    if (sbomId === null) {
      prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    }
  }, [sbomId])

  useEffect(() => {
    if (environment && data) {
      const env = data?.shareLynkQuery?.projectGroup?.projects.find(
        (item) => item.name === environment
      )
      console.log('env', env)
      localStorage.setItem('publicEnv', env?.id)
      setActiveEnv(env?.id)
    }
  }, [environment])

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
    <>
      <Flex flexDirection={'column'} alignItems={'flex-start'} gap={6}>
        {/* INFO SECTION */}
        <Card>
          <CardBody>
            {data && (
              <Grid
                width={'100%'}
                templateColumns='repeat(5, 1fr)'
                alignItems={'top'}
                gap={10}
              >
                {/* PRODUCT INFORMATIONS */}
                <GridItem colSpan={3}>
                  <Flex
                    direction={'row'}
                    alignItems={'flex-start'}
                    gap={5}
                    width={'100%'}
                  >
                    <Icon
                      as={FaWindowMaximize}
                      h={'64px'}
                      w={'64px'}
                      color='blue.300'
                    />
                    <Flex direction={'column'} gap={0.5}>
                      {/* PRODUCT TITLE */}
                      <Stack
                        direction={'column'}
                        spacing={1}
                        alignItems={'left'}
                      >
                        <Text fontWeight={'semibold'} fontSize={25}>
                          {data?.shareLynkQuery?.projectGroup?.name || ''}
                        </Text>
                      </Stack>
                      {/* PRODUCT DESCRIPTION */}
                      <Text fontSize={'sm'}>
                        {data?.shareLynkQuery?.projectGroup?.description || ''}
                      </Text>
                    </Flex>
                  </Flex>
                </GridItem>
                {/* PRODUCT ACTIONS */}
                <GridItem colSpan={2}></GridItem>
              </Grid>
            )}
          </CardBody>
        </Card>
        {/* TAB SECTION */}
        <Card>
          <CardBody>
            <Tabs
              variant='enclosed'
              w={'100%'}
              bg={'white'}
              index={activeCsProdTab}
              onChange={(value) => handleTabChange(value)}
            >
              <TabList>
                {['versions','vulnerabilities', 'automation rules', 'settings', 'change log'].map(
                  (item, index) => (
                    <Tab
                      key={index}
                      _focus={{ outline: 'none' }}
                      textTransform={'capitalize'}
                      isDisabled={ item === 'automation rules' || item === 'settings' || item === 'change log' || item === 'vulnerabilities'}
                    >
                      {(item === 'automation rules' || item === 'settings' || item === 'change log' || item === 'vulnerabilities') && (
                        <FaLock
                          color='darkgray'
                          style={{ marginRight: '6px' }}
                        />
                      )}
                      {item}
                    </Tab>
                  )
                )}
              </TabList>
              <TabPanels>
                {/* VERSIONS */}
                <TabPanel px={0}>
                  {data && (
                    <VersionsTable
                      productId={activeEnv}
                      projectGroup={data?.shareLynkQuery?.projectGroup}
                      getVulnData={vulnRefetch}
                    />
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </Flex>
    </>
  )
}

export default ProductDetails
