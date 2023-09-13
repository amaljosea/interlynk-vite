// Chakra imports
import {
  Flex,
  Button,
  useDisclosure,
  Table,
  Tr,
  Td,
  Skeleton,
  Thead,
  Tbody,
  Box,
  Th,
  Tooltip,
  IconButton,
  Text
} from '@chakra-ui/react'
import { useState, useContext, useEffect, useRef } from 'react'
import ProductVersions from './components/ProductVersions'
import { AddIcon, RepeatIcon } from '@chakra-ui/icons'
import Card from 'components/Card/Card'
import CardHeader from 'components/Card/CardHeader'
import GlobalContext from 'context/GlobalContext'
import ProductModal from './components/ProductModal.js'
import { useQuery } from '@apollo/client'
import { GetProjectData } from 'graphQL/Queries'
import { useLocation } from 'react-router-dom'
import SBOM from 'views/Sbom'

function Index() {
  const { productVersionsData } = useContext(GlobalContext)

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

  const [isLoading, setIsLoading] = useState(false)

  const { data, refetch, error, loading } = useQuery(GetProjectData, {
    variables: {
      first: 10
    }
  })

  useEffect(() => {
    if (data) console.log(`Products`, data)
  }, [data])

  const handlePreviousPage = () => {
    refetch({
      first: undefined,
      last: 10,
      before: data.projects.pageInfo.startCursor,
      after: ''
    })
  }

  const handleNextPage = () => {
    refetch({
      first: 10,
      last: undefined,
      after: data.projects.pageInfo.endCursor,
      before: ''
    })
  }

  const handleRefresh = async () => {
    try {
      setIsLoading(true)
      await refetch({
        first: 10
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

  const [groupVersionData, setGroupVersionData] = useState([])
  const [showVersion, setShowVersion] = useState(true)
  const {
    isOpen: isOpenProduct,
    onOpen: onOpenProduct,
    onClose: onCloseProduct
  } = useDisclosure()

  const btnRefProduct = useRef('Product')

  useEffect(() => {
    if (!showVersion) {
      setGroupVersionData(productVersionsData)
    } else {
      setGroupVersionData([])
    }
  }, [showVersion])

  if (product === null) {
    return (
      <>
        <Flex direction='column' pt={{ base: '120px', md: '0px' }}>
          <Flex direction='row' pt={{ base: '200px', md: '75px' }}>
            <Card my='22px' overflowX={{ sm: 'scroll', xl: 'hidden' }}>
              <CardHeader>
                <Flex
                  width={'100%'}
                  direction={'row'}
                  gap={2}
                  alignItems={'center'}
                  justifyContent={'flex-end'}
                >
                  {/* refresh */}
                  <Tooltip label='Refresh'>
                    <IconButton
                      colorScheme='blue'
                      icon={<RepeatIcon />}
                      onClick={handleRefresh}
                    ></IconButton>
                  </Tooltip>
                  {/* add product */}
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

              {error && (
                <Flex my={10} alignItems={'center'} justifyContent={'center'}>
                  <Text textAlign={'center'} fontSize={14}>
                    {error.message}
                  </Text>
                </Flex>
              )}

              {loading && (
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

              {data && (
                <ProductVersions
                  title={'Products'}
                  captions={captions}
                  allProjects={data}
                  handlePreviousPage={handlePreviousPage}
                  handleNextPage={handleNextPage}
                  isLoading={isLoading}
                  refetch={refetch}
                />
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
  } else {
    return <SBOM />
  }
}

export default Index
