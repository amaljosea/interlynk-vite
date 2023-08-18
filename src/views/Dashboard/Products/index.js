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
  useDisclosure
} from '@chakra-ui/react'
import { useState, useContext, useEffect, useRef } from 'react'
import ProductVersions from './components/ProductVersions'
import { ChevronDownIcon, AddIcon } from '@chakra-ui/icons'
import GlobalContext from 'context/GlobalContext'
import ProductModal from './components/ProductModal.js'
import { useLazyQuery } from '@apollo/client'
import { GetProjectData } from 'graphQL/Queries'
import { useLocation } from 'react-router-dom'
import SBOM from 'views/Sbom'

function Index() {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const product = queryParams.get('p')
  const version = queryParams.get('v')

  const [GetProjects, { data: allProjects, refetch }] = useLazyQuery(
    GetProjectData
  )

  useEffect(() => {
    if (allProjects === undefined) {
      GetProjects({
        variables: {
          first: 10
        }
      })
    }
  }, [])

  const handlePreviousPage = () => {
    GetProjects({
      variables: {
        first: undefined,
        last: 10,
        before: allProjects.projects.pageInfo.startCursor,
        after: ''
      }
    })
  }

  const handleNextPage = () => {
    GetProjects({
      variables: {
        first: 10,
        last: undefined,
        after: allProjects.projects.pageInfo.endCursor,
        before: ''
      }
    })
  }

  useEffect(() => {
    console.log(`all projects`, allProjects)
  }, [allProjects])

  const { productVersionsData, productVersionExploded } = useContext(
    GlobalContext
  )
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

  // productVersionsData.map((project) => {
  //   if (uniqProjects.indexOf(project.name) === -1) {
  //     uniqProjects.push(project.name)
  //   }
  // })
  const uniqVersions = []
  productVersionsData.map((project) => {
    project.versions.map((version) => {
      if (uniqVersions.indexOf(version.version) === -1) {
        uniqVersions.push(version.version)
      }
    })
  })

  // useEffect(() => {
  //   const productExploded = []
  //   productVersionsData.map((p) => {
  //     p.versions.map((v) => {
  //       productExploded.push({
  //         name: p.name,
  //         description: p.description,
  //         logo: p.logo,
  //         version: v.version,
  //         vendor: p.vendor,
  //         quality_score: p.quality_score,
  //         sbom_links: v.sbom_links,
  //         risk_score: v.risk_score,
  //         updated_at: v.updated_at,
  //         active: v.active,
  //         source: p.source
  //       })
  //     })
  //   })

  //   setProductVersionExploded(productExploded)
  // }, [productVersionsData])

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

  productVersionExploded.sort((a, b) => (a.updated_at > b.updated_at ? -1 : 1))

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
          <Input placeholder='Search' maxW='300px' />

          <Spacer />
          <Stack direction='row' spacing={2}>
            {/* upload */}
            {/* <FileUpload /> */}
            <Button
              ref={btnRefProduct}
              onClick={onOpenProduct}
              leftIcon={<AddIcon />}
              colorScheme='green'
              size='sm'
              variant='solid'
              borderRadius='6px'
            >
              Product
            </Button>
          </Stack>
        </Flex>
        {allProjects && (
          <ProductVersions
            title={'Products'}
            captions={[
              'Active',
              'Product',
              'Description',
              'Updated At',
              'Action'
            ]}
            allProjects={allProjects}
            handlePreviousPage={handlePreviousPage}
            handleNextPage={handleNextPage}
          />
        )}
      </Flex>

      <ProductModal
        isOpen={isOpenProduct}
        onClose={onCloseProduct}
        product={''}
        vendorName={''}
      />
    </>
  )
}

export default Index
