// Chakra imports
import { Flex, Text } from '@chakra-ui/react'
import { useContext, useEffect } from 'react'
import Card from 'components/Card/Card'
import GlobalContext from 'context/GlobalContext'
import { useQuery } from '@apollo/client'
import { GetProjectData } from 'graphQL/Queries'
import { useLocation } from 'react-router-dom'
import SBOM from 'views/Sbom'
import ProductTable from 'components/Tables/ProductTable'

function Index() {
  const {
    prodField,
    prodDirection,
    setTotalProducts,
    setCompSearchInput,
    setCompEcosystem,
    setCompType,
    setCompLicense,
    setCompSupplier,
    setCompScope,
    setVulnSeverity,
    setVulnComponent,
    setVulnStatus,
    setVulnKev,
    setVulnEpss,
    setMinVal,
    setMaxVal,
    totalRows,
    setCheckSearchInput,
    setCheckRules,
    setCheckCategory,
    setCheckSeverity,
    setCheckStatus,
    setCheckDirection
  } = useContext(GlobalContext)

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const product = queryParams.get('p')

  const { data, refetch, error } = useQuery(GetProjectData, {
    variables: {
      first: totalRows,
      enabled: true,
      field: prodField,
      direction: prodDirection
    }
  })

  useEffect(() => {
    if (data) {
      setTotalProducts(data.projects.totalCount)
    }
  }, [data])

  useEffect(() => {
    if (product === null) {
      setCompSearchInput('')
      setCompEcosystem([])
      setCompType([])
      setCompLicense([])
      setCompSupplier([])
      setCompScope('')
      setVulnSeverity([])
      setVulnComponent([])
      setVulnStatus([])
      setVulnKev('')
      setVulnEpss('')
      setMinVal(0)
      setMaxVal(10000)
      setCheckSearchInput('')
      setCheckRules([])
      setCheckCategory([])
      setCheckSeverity([])
      setCheckStatus([])
      setCheckDirection('DESC')
    }
  }, [product])

  if (!data && error) {
    return (
      <Flex my={32} alignItems={'center'} justifyContent={'center'}>
        <Text textAlign={'center'} fontSize={14}>
          Internal error occured. Please retry in few minutes.
        </Text>
      </Flex>
    )
  } else {
    if (product === null) {
      return (
        <Flex
          flexDirection='column'
          pt={{ base: '120px', md: '74px' }}
          pr={2}
          pl={5}
        >
          <Card overflowX={{ sm: 'scroll', xl: 'hidden' }}>
            <ProductTable data={data?.projects} refetch={refetch} />
          </Card>
        </Flex>
      )
    } else {
      return <SBOM />
    }
  }
}

export default Index
