import { useLazyQuery } from '@apollo/client'
import {
  Flex,
  Skeleton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Button,
  Text
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import ComponentTable from 'components/Tables/ComponentTable'
import GeneralDataRow from 'components/Tables/GeneralDataRow'
import VulnTable from 'components/Tables/VulnTable'
import GlobalContext from 'context/GlobalContext'
import { GetSignedVulnData } from 'graphQL/Queries'
import { GetSignedCompFilterData } from 'graphQL/Queries'
import { GetSignedVulnFilterData } from 'graphQL/Queries'
import { GetSignedComponentData } from 'graphQL/Queries'
import Cookies from 'js-cookie'
import { useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const SignedSbomTable = ({
  refetch,
  data,
  status,
  type,
  filteredData,
  getVulnData,
  vulnData
}) => {
  const location = useLocation()

  const queryParams = new URLSearchParams(location.search)

  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')

  const [tabIndex, setTabIndex] = useState(0)
  const [totalRows, setTotalRows] = useState(25)
  const [componentIndex, setComponentIndex] = useState(1)
  const [vulnIndex, setVulnIndex] = useState(1)

  const signedParams = Cookies.get(`signedParamId`)

  const {
    signedCompField,
    signedCompDirection,
    setSignedCompFilters,
    signedVulnField,
    signedVulnDirection,
    setSignedVulnFilters,
    signedVulnSeverity,
    signedVulnComponent,
    signedVulnStatus,
    signedVulnKev,
    signedVulnEpss,
    signedActiveTab,
    setSignedActiveTab
  } = useContext(GlobalContext)

  const { lifecycle } = data

  // GET COMPONENT DATA
  const [
    getCompData,
    { data: compData, refetch: compRefetch, error, loading }
  ] = useLazyQuery(GetSignedComponentData)

  // GET COMPONENT FILTER HEADS
  const [getCompFilters, { refetch: compFilterRefetch }] = useLazyQuery(
    GetSignedCompFilterData
  )

  // GET VULN FILTER HEADS
  const [getVulnFilters, { refetch: vulnFilterRefetch }] = useLazyQuery(
    GetSignedVulnFilterData
  )

  const epss = signedVulnEpss !== 'all' && signedVulnEpss.split('-')

  const range = {
    min: parseFloat(epss[0]),
    max: parseFloat(epss[1])
  }

  // FETCH FILTER DATA BASE ON SELECTED TAB
  useEffect(() => {
    if (signedActiveTab === 0) {
      refetch({
        projectId: productId,
        sbomId: sbomId,
        signedParams: signedParams
      })
    } else if (signedActiveTab === 1) {
      getCompData({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          signedParams: signedParams,
          first: totalRows,
          field: signedCompField,
          direction: signedCompDirection
        }
      })
      getCompFilters({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          signedParams: signedParams
        }
      }).then((res) => {
        if (res.data) {
          setSignedCompFilters(res.data.sbom.filters)
        }
      })
    } else if (signedActiveTab === 2) {
      getVulnData({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          signedParams: signedParams,
          severity:
            signedVulnSeverity.length > 0 ? signedVulnSeverity : undefined,
          componentName:
            signedVulnComponent.length > 0 ? signedVulnComponent : undefined,
          status: signedVulnStatus.length > 0 ? signedVulnStatus : undefined,
          kev:
            signedVulnKev === 'all'
              ? undefined
              : signedVulnKev === 'yes'
              ? true
              : false,
          epss:
            signedVulnEpss !== '' && signedVulnEpss !== 'all'
              ? range
              : undefined,
          first: totalRows,
          field: signedVulnField,
          direction: signedVulnDirection
        }
      })
      getVulnFilters({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          signedParams: signedParams
        }
      }).then((res) => {
        if (res.data) {
          setSignedVulnFilters(res.data.sbom.filters)
        }
      })
    }
  }, [signedActiveTab])

  return (
    <Card>
      <Tabs
        variant='enclosed'
        index={signedActiveTab}
        onChange={(value) => setSignedActiveTab(Number(value))}
      >
        {/* TAB LIST */}
        <TabList mt='20px'>
          {['General', 'Components', 'Vulnerabilities'].map((item, index) => (
            <Tab key={index} _focus={{ outline: 'none' }}>
              {item}
            </Tab>
          ))}
        </TabList>
        {/* TAB PANELS */}
        <TabPanels>
          {/* GENERAL TABLE */}
          <TabPanel px={1}>
            {data ? (
              <GeneralDataRow
                status={status}
                type={type}
                data={data}
                refetch={refetch}
              />
            ) : (
              <Flex width={'100%'} gap={4} direction={'column'}>
                <Skeleton width={'100%'} height='20px' />
                <Skeleton width={'100%'} height='20px' />
                <Skeleton width={'100%'} height='20px' />
                <Skeleton width={'100%'} height='20px' />
                <Skeleton width={'100%'} height='20px' />
              </Flex>
            )}
          </TabPanel>
          {/* COMPONENT TABLE */}
          <TabPanel px={0}>
            {compData && data && (
              <ComponentTable
                type={type}
                lifecycle={lifecycle}
                data={compData.sbom.components}
                loading={loading}
                error={error}
                refetch={compRefetch}
                filterRefetch={compFilterRefetch}
                primaryComp={data.primaryComponent}
              />
            )}

            {loading && (
              <Flex width={'100%'} gap={4} direction={'column'}>
                <Skeleton width={'100%'} height='20px' />
                <Skeleton width={'100%'} height='20px' />
                <Skeleton width={'100%'} height='20px' />
                <Skeleton width={'100%'} height='20px' />
                <Skeleton width={'100%'} height='20px' />
              </Flex>
            )}

            {error && (
              <Flex
                py={10}
                flexDirection={'column'}
                gap={2}
                width={'70%'}
                mx={'auto'}
                alignItems={'center'}
                justifyContent={'center'}
              >
                <Text color={'red.500'} textAlign={'center'}>
                  {error.message}
                </Text>
                <Text>Something went wrong. Please refresh this page</Text>
                <Button
                  mt={2}
                  variant='solid'
                  colorScheme='blue'
                  fontWeight={'normal'}
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </Button>
              </Flex>
            )}
          </TabPanel>
          {/* VULN TABLE */}
          <TabPanel px={0}>
            <VulnTable
              data={vulnData?.sbom?.vulns}
              filteredData={filteredData}
              refetch={getVulnData}
              productId={productId}
              sbomId={sbomId}
              filterRefetch={vulnFilterRefetch}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Card>
  )
}

export default SignedSbomTable
