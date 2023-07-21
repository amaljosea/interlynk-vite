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
  Switch
} from '@chakra-ui/react'
import React, { useState } from 'react'
import ProductVersions from './components/ProductVersions'
import { ChevronDownIcon, AddIcon, LinkIcon, CopyIcon } from '@chakra-ui/icons'
import SBOMLinkDrawer from 'components/Drawer/SBOMLinkDrawer.js'
import ProductAssembleDrawer from 'components/Drawer/ProductAssembleDrawer.js'
import { useDisclosure } from '@chakra-ui/react'
import GlobalContext from 'context/GlobalContext'
import { useContext } from 'react'
import FileUpload from 'components/FileUpload'
import { useEffect } from 'react'

function Products() {
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
            <MenuOptionGroup title='Products'>
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
            Source
          </MenuButton>
          <MenuList fontWeight='none' fontSize='sm'>
            <MenuOptionGroup title='Source'>
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
            Risk Score
          </MenuButton>
          <MenuList fontWeight='none' fontSize='sm'>
            <MenuOptionGroup title='Source'>
              <MenuItemOption
                value={'100'}
                onClick={() => filterByRisk(0, 100)}
              >
                all
              </MenuItemOption>
              <MenuItemOption value={'20'} onClick={() => filterByRisk(0, 20)}>
                0-20
              </MenuItemOption>
              <MenuItemOption value={'25'} onClick={() => filterByRisk(21, 25)}>
                21-25
              </MenuItemOption>
              <MenuItemOption
                value={'26'}
                onClick={() => filterByRisk(26, 100)}
              >
                26+
              </MenuItemOption>
            </MenuOptionGroup>
          </MenuList>
        </Menu>
        <Flex direction={'row'} gap={2} alignItems={'center'} mr={3}>
          <Switch isChecked={showVersion} onChange={groupByVersion} size='md' />
          <Text>Show Version</Text>
        </Flex>
        <Flex direction={'row'} gap={2} alignItems={'center'} mr={3}>
          <Switch
            isChecked={showArchived}
            onChange={(e) => setShowArchived(!showArchived)}
            size='md'
          />
          <Text>Show Archived</Text>
        </Flex>
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
          <ProductAssembleDrawer
            isOpen={isOpenProduct}
            onClose={onCloseProduct}
            btnRef={btnRefProduct}
            uniqProjects={uniqProjects}
            uniqVersions={uniqVersions}
            link={[]}
            shared_with={[]}
            components={true}
            licenses={true}
            vulnerability={false}
            conf_email={true}
            conf_terms={true}
            redactions={false}
            cyclonedx={true}
            spdx={true}
          />
        </Stack>
      </Flex>
      <ProductVersions
        title={'Products'}
        captions={[
          'Active',
          'Product',
          'Vendor',
          'Quality Score',
          'Version',
          'Share Lynks',
          'Risk Score',
          'Last Updated',
          ''
        ]}
        filterData={filterData}
        groupVersionData={groupVersionData}
        productVersionsData={productVersionExploded}
      />{' '}
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
  )
}

export default Products
