import { useLazyQuery } from '@apollo/client'
import {
  Flex,
  Skeleton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import ComponentTable from 'components/Tables/ComponentTable'
import GeneralDataRow from 'components/Tables/GeneralDataRow'
import GlobalContext from 'context/GlobalContext'
import { GetSignedCompFilterData } from 'graphQL/Queries'
import { GetSignedComponentData } from 'graphQL/Queries'
import Cookies from 'js-cookie'
import { useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const SignedSbomTable = ({ refetch, data, status, type }) => {
  const location = useLocation()

  const queryParams = new URLSearchParams(location.search)

  const productId = queryParams.get('p')
  const sbomId = queryParams.get('sbom')

  const [tabIndex, setTabIndex] = useState(0)
  const [totalRows, setTotalRows] = useState(25)
  const [componentIndex, setComponentIndex] = useState(1)

  const signedParams = Cookies.get(`signedParamId`)

  const { signedCompField, signedCompDirection, setSignedCompFilters } =
    useContext(GlobalContext)

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

  // FETCH COMPONENT DATA
  useEffect(() => {
    if (compData === undefined) {
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
    }
  }, [])

  // FETCH FILTER DATA BASE ON SELECTED TAB
  useEffect(() => {
    if (tabIndex === 0) {
      refetch({
        projectId: productId,
        sbomId: sbomId,
        signedParams: signedParams
      })
    } else if (tabIndex === 1) {
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
    }
  }, [tabIndex])

  return (
    <Card>
      <Tabs
        variant='enclosed'
        defaultIndex={tabIndex}
        onChange={(value) => setTabIndex(value)}
      >
        {/* TAB LIST */}
        <TabList mt='20px'>
          {['General', 'Components'].map((item, index) => (
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
                pageIndex={componentIndex}
                setPageIndex={setComponentIndex}
                primaryComp={data.primaryComponent}
                totalRows={totalRows}
                setTotalRows={setTotalRows}
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
        </TabPanels>
      </Tabs>
    </Card>
  )
}

export default SignedSbomTable
