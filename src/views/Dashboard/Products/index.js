// Chakra imports
import {
  Flex,
  Menu,
  MenuList,
  MenuButton,
  MenuOptionGroup,
  MenuItemOption,
  Button,
  Input,
  Spacer,
  Stack,
  useDisclosure,
  Table,
  Tr,
  Td,
  Skeleton,
  Thead,
  Tbody,
  Box,
  Th
} from '@chakra-ui/react'
import { useState, useContext, useEffect, useRef } from 'react'
import ProductVersions from './components/ProductVersions'
import { ChevronDownIcon, AddIcon } from '@chakra-ui/icons'
import Card from 'components/Card/Card'
import CardHeader from 'components/Card/CardHeader'
import GlobalContext from 'context/GlobalContext'
import ProductModal from './components/ProductModal.js'
import { useLazyQuery, useQuery } from '@apollo/client'
import { GetProjectData } from 'graphQL/Queries'
import { useLocation } from 'react-router-dom'
import SBOM from 'views/Sbom'

function Index() {
  const {
    productVersionsData,
    productVersionExploded,
    setProductStatus
  } = useContext(GlobalContext)

  const captions = [
    'active',
    'product',
    'versions',
    'description',
    'updated at',
    'action'
  ]

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const product = queryParams.get('p')
  const version = queryParams.get('v')

  const [getProjects, { data }] = useLazyQuery(GetProjectData)

  const [isLoading, setIsLoading] = useState(false)

  const handlePreviousPage = () => {
    getProjects({
      variables: {
        first: undefined,
        last: 10,
        before: data.projects.pageInfo.startCursor,
        after: ''
      }
    })
  }

  const handleNextPage = () => {
    getProjects({
      variables: {
        first: 10,
        last: undefined,
        after: data.projects.pageInfo.endCursor,
        before: ''
      }
    })
  }

  useEffect(() => {
    if (data === undefined) {
      getProjects({
        variables: {
          first: 10
        }
      })
    }
  }, [data])

  const handleRefresh = async () => {
    try {
      setIsLoading(true)
      await getProjects({
        variables: {
          first: undefined,
          last: 10
        }
      }).then(() => {
        setTimeout(() => {
          setIsLoading(false)
        }, 2000)
      })
    } catch (error) {
      if (error.networkError && error.networkError.statusCode === 500) {
        // Handle the specific error
        alert('Something went wrong')
      } else {
        // Handle other errors
        alert(error.message)
      }
    }
  }

  // useEffect(() => {
  //   console.log(`products`, projects)
  // }, [projects])

  const [filterData, setFilterData] = useState([])
  const [groupVersionData, setGroupVersionData] = useState([])
  const [showVersion, setShowVersion] = useState(true)
  const [showArchived, setShowArchived] = useState(false)
  const {
    isOpen: isOpenProduct,
    onOpen: onOpenProduct,
    onClose: onCloseProduct
  } = useDisclosure()

  const uniqProjects = [
    'all',
    'sbomqs',
    'dashboard-app',
    'sbomasm',
    'homebrew-interlynk',
    'sbom-benchmark',
    'sbomex',
    'sbomgr',
    'sbomdb',
    'sbomlc',
    'sbombenchmark.dev',
    'sbom-combined',
    'purl-tools',
    'purl-mapper',
    'lynk_model_mapping',
    'lynk-service'
  ]
  const btnRefProduct = useRef('Product')
  const btnRefSBOMLink = useRef('SBOMLink')

  const groupByVersion = (e) => {
    setShowVersion(!showVersion)
  }

  useEffect(() => {
    if (!showVersion) {
      setGroupVersionData(productVersionsData)
    } else {
      setGroupVersionData([])
    }
  }, [showVersion])

  const filterByProduct = (p) => {
    const filterList =
      p !== 'all'
        ? productVersionExploded.filter(
            (item) => item.name == p && item.name == p
          )
        : productVersionExploded
    console.log('filterList', filterList)
    filterList.length > 0 ? setFilterData(filterList) : setFilterData([])
  }

  const filterBySource = (source) => {
    const filterSourceList =
      source !== 'All'
        ? productVersionExploded.filter((item) => item.source == source)
        : productVersionExploded
    setFilterData(filterSourceList)
  }

  const filterByRisk = (a, b) => {
    const filterRiskList = productVersionExploded.filter(
      (item) => item.risk_score >= a && item.risk_score <= b
    )
    console.log('filterRiskList', filterRiskList)
    setFilterData(filterRiskList)
  }

  const filterByRow = (num) => {
    const filterRowList = productVersionExploded.slice(0, Number(num))
    console.log('filterRowList', filterRowList)
    setFilterData(filterRowList)
  }

  if (product) {
    return <SBOM />
  }

  return (
    <>
      <Flex direction='column' pt={{ base: '120px', md: '0px' }}>
        <Flex direction='row' pt={{ base: '200px', md: '75px' }}>
          <Card my='22px' overflowX={{ sm: 'scroll', xl: 'hidden' }}>
            <CardHeader>
              <Flex
                width={'100%'}
                direction={'row'}
                gap={4}
                alignItems={'center'}
                justifyContent={'flex-end'}
              >
                {/* upload */}
                <Button
                  colorScheme='blue'
                  variant='solid'
                  onClick={handleRefresh}
                >
                  Refresh
                </Button>
                <Button
                  ref={btnRefProduct}
                  onClick={onOpenProduct}
                  leftIcon={<AddIcon />}
                  colorScheme='blue'
                  variant='solid'
                >
                  Product
                </Button>
              </Flex>
            </CardHeader>
            {/* <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              maxW='150px'
              px={4}
              py={2}
              me={2}
              transition='all 0.2s'
              borderRadius='md'
              borderWidth='1px'
              fontSize='sm'
              fontWeight='none'
            >
              Product
            </MenuButton>
            <MenuList fontWeight='none' fontSize='sm'>
              <MenuOptionGroup>
                {uniqProjects.map((p) => (
                  <MenuItemOption
                    key={p}
                    value={p}
                    onClick={() => filterByProduct(p)}
                  >
                    {p}
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              maxW='150px'
              px={4}
              py={2}
              me={2}
              transition='all 0.2s'
              borderRadius='md'
              borderWidth='1px'
              fontSize='sm'
              fontWeight='none'
            >
              Vendor
            </MenuButton>
            <MenuList fontWeight='none' fontSize='sm'>
              <MenuOptionGroup>
                <MenuItemOption
                  value={'All'}
                  onClick={(e) => filterBySource('All')}
                >
                  All
                </MenuItemOption>
                <MenuItemOption
                  value={'GitHub'}
                  onClick={(e) => filterBySource('GitHub')}
                >
                  GitHub
                </MenuItemOption>
                <MenuItemOption
                  value={'SBOM'}
                  onClick={(e) => filterBySource('SBOM')}
                >
                  SBOM
                </MenuItemOption>
                <MenuItemOption
                  value={'Assembled'}
                  onClick={(e) => filterBySource('Assembled')}
                >
                  Assembled
                </MenuItemOption>
              </MenuOptionGroup>
            </MenuList>
          </Menu>
          <Input placeholder='Search' maxW='300px' /> */}

            {data ? (
              <ProductVersions
                title={'Products'}
                captions={captions}
                allProjects={data}
                handlePreviousPage={handlePreviousPage}
                handleNextPage={handleNextPage}
                isLoading={isLoading}
              />
            ) : (
              <Table mt={4}>
                <Thead>
                  <Tr my='.8rem'>
                    {captions.map((caption, idx) => {
                      return (
                        <Th color='gray.800' key={idx} pl={0}>
                          <Box>{caption}</Box>
                        </Th>
                      )
                    })}
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td pl={0}>
                      <Skeleton height='20px' />
                    </Td>
                    <Td pl={0}>
                      <Skeleton height='20px' />
                    </Td>
                    <Td pl={0}>
                      <Skeleton height='20px' />
                    </Td>
                    <Td pl={0}>
                      <Skeleton height='20px' />
                    </Td>
                    <Td pl={0}>
                      <Skeleton height='20px' />
                    </Td>
                    <Td pl={0}>
                      <Skeleton height='20px' />
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            )}
          </Card>
        </Flex>
      </Flex>

      {isOpenProduct && (
        <ProductModal
          isOpen={isOpenProduct}
          onClose={onCloseProduct}
          product={''}
          vendorName={''}
        />
      )}
    </>
  )
}

export default Index
