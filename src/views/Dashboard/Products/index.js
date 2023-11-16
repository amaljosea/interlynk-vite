// Chakra imports
import {
  Flex,
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
  Text,
  useToast
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
  const {
    productVersionsData,
    setTotalProducts,
    setCompSearchInput,
    setCompEcosystem,
    setCompType,
    setCompLicense,
    setCompSupplier,
    setCompScope
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

  const [isLoading, setIsLoading] = useState(false)
  const [pageIndex, setPageIndex] = useState(1)
  const [totalRows, setTotalRows] = useState(25)
  const toast = useToast()

  const { data, refetch, error, loading } = useQuery(GetProjectData, {
    variables: {
      first: totalRows,
      last: undefined,
      after: undefined,
      before: undefined
    }
  })

  useEffect(() => {
    if (data) {
      setPageIndex(1)
      setTotalProducts(data.projects.totalCount)
    }
  }, [data])

  const handlePreviousPage = () => {
    setPageIndex((prev) => pageIndex !== 0 && prev - 1)
    refetch({
      last: totalRows,
      before: data.projects.pageInfo.startCursor,
      first: undefined,
      after: undefined
    })
  }

  const handleNextPage = () => {
    setPageIndex(
      (prev) => prev < Math.ceil(data.projects.totalCount) && prev + 1
    )
    refetch({
      first: totalRows,
      after: data.projects.pageInfo.endCursor,
      last: undefined,
      before: undefined
    })
  }

  const handleRefresh = async () => {
    try {
      setIsLoading(true)
      await refetch({
        first: totalRows
      }).then(() => {
        console.error('Refresh error', error)
        setIsLoading(false)
        setTimeout(() => {
          setIsLoading(false)
        }, 2000)
      })
    } catch (error) {
      console.error('Refresh error', error)
      toast({
        description:
          'An error occured while refreshing products. Please retry in few minutes.',
        status: 'error',
        duration: 2000,
        position: 'top'
      })
      setIsLoading(false)
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

  useEffect(() => {
    if (product === null) {
      setCompSearchInput('')
      setCompEcosystem([])
      setCompType([])
      setCompLicense([])
      setCompSupplier([])
      setCompScope('')
    }
  }, [product])

  if (product === null) {
    return (
      <>
        <Flex flexDirection='column' pt={{ base: '120px', md: '74px' }} px={2}>
          <Card overflowX={{ sm: 'scroll', xl: 'hidden' }} pb={0}>
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
                <Tooltip label='Add Product'>
                  <IconButton
                    ref={btnRefProduct}
                    onClick={onOpenProduct}
                    icon={<AddIcon />}
                    colorScheme='blue'
                    variant='solid'
                  />
                </Tooltip>
              </Flex>
            </CardHeader>

            {error && (
              <Flex my={10} alignItems={'center'} justifyContent={'center'}>
                <Text textAlign={'center'} fontSize={14}>
                  Internal error occured. Please retry in few minutes.
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
                totalRows={totalRows}
                setTotalRows={setTotalRows}
                pageIndex={pageIndex}
                setPageIndex={setPageIndex}
              />
            )}
          </Card>
        </Flex>

        {isOpenProduct && (
          <ProductModal
            isOpen={isOpenProduct}
            refetch={refetch}
            totalRows={totalRows}
            onClose={onCloseProduct}
            id={null}
            product={null}
            description={null}
            allProjects={null}
            type={null}
          />
        )}
      </>
    )
  } else {
    return <SBOM />
  }
}

export default Index
