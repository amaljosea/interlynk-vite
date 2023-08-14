// Chakra imports
import {
  Flex,
  Menu,
  MenuList,
  MenuItem,
  MenuButton,
  MenuOptionGroup,
  MenuItemOption,
  Button,
  Input,
  Spacer,
  Stack,
  Text,
  Switch,
  useDisclosure
} from '@chakra-ui/react'
import React, { useState, useContext, useEffect } from 'react'
import ProductVersions from './components/ProductVersions'
import { ChevronDownIcon, AddIcon } from '@chakra-ui/icons'
import SBOMLinkDrawer from 'components/Drawer/SBOMLinkDrawer.js'
import ProductAssembleDrawer from 'components/Drawer/ProductAssembleDrawer.js'
import GlobalContext from 'context/GlobalContext'
import FileUpload from 'components/FileUpload'
import ProductModal from './components/ProductModal.js'
import { useLazyQuery } from '@apollo/client'
import { GetProjectData } from 'graphQL/Queries'

function Products() {
  const [getAllProjects, { data: allProjects, loading }] = useLazyQuery(
    GetProjectData
  )

  useEffect(() => {
    if (allProjects === undefined) {
      getAllProjects({
        variables: {
          first: 10
        }
      })
    }
  }, [])

  useEffect(() => {
    console.log(`all projects`, allProjects)
  }, [allProjects])

  const {
    productVersionsData,
    productVersionExploded,
    setProductVersionExploded
  } = useContext(GlobalContext)
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
  const btnRefProduct = React.useRef('Product')
  const btnRefSBOMLink = React.useRef('SBOMLink')

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
            <FileUpload />
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
        <ProductVersions
          title={'Products'}
          captions={[
            'Active',
            'Product',
            'Vendor',
            'Version',
            'Last Updated',
            'Action'
          ]}
          filterData={filterData}
          groupVersionData={groupVersionData}
          productVersionsData={productVersionExploded}
        />
        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDownIcon />}
            maxW='fit-content'
            px={4}
            py={2}
            me={2}
            transition='all 0.2s'
            borderRadius='md'
            borderWidth='1px'
            fontSize='sm'
            fontWeight='none'
          >
            Rows
          </MenuButton>
          <MenuList fontWeight='none' fontSize='sm' width={'fit-content'}>
            <MenuOptionGroup title='No of rows'>
              <MenuItemOption value={'5'} onClick={() => filterByRow(5)}>
                5
              </MenuItemOption>
              <MenuItemOption value={'10'} onClick={() => filterByRow(10)}>
                10
              </MenuItemOption>
              <MenuItemOption value={'15'} onClick={() => filterByRow(15)}>
                15
              </MenuItemOption>
              <MenuItemOption value={'20'} onClick={() => filterByRow(20)}>
                20
              </MenuItemOption>
              <MenuItemOption value={'25'} onClick={() => filterByRow(25)}>
                25
              </MenuItemOption>
            </MenuOptionGroup>
          </MenuList>
        </Menu>
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

export default Products
