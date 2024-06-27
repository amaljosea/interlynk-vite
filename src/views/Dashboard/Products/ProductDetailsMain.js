import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ProductDetailsTabs } from 'utils/TabsObjects'

import { Search2Icon } from '@chakra-ui/icons'
import {
  Button,
  Flex,
  Grid,
  GridItem,
  Icon,
  IconButton,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Text,
  Tooltip,
  UnorderedList,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import EnvironmentDrawer from 'components/Drawer/EnvironmentDrawer'
import NotificationMenuBell from 'components/Notifications/NotificationMenuBell'
import ChangelogTable from 'components/Tables/ChangelogTable'
import GlobalVulnTable from 'components/Tables/GlobalVulnTable'
import PolicyTable from 'components/Tables/PolicyTable'
import VersionsTable from 'components/Tables/VersionsTable'

import { useGlobalState } from 'hooks/useGlobalState'
import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'
import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { DeleteProjectGroup } from 'graphQL/Mutation'
import {
  GetGlobalVulns,
  GetOrgMfc,
  GetProjectGroup,
  GetProjectPolicies,
  GetProjectSettings,
  GetVulnData
} from 'graphQL/Queries'

import { FaBug, FaRobot, FaTag } from 'react-icons/fa'
import {
  FaBoxArchive,
  FaPenToSquare,
  FaToggleOff,
  FaToggleOn,
  FaUpload,
  FaWindowMaximize
} from 'react-icons/fa6'

import Automation from '../Automation'
import Settings from '../ProductSettings'
import { ProductGraphs } from './ProductGraphs'
import ProductModal from './components/ProductModal'
import StatusModal from './components/StatusModal'
import UploadModal from './components/UploadModal'

const SettingsTag = ({ icon, label, settings }) => {
  const scanColor = useColorModeValue('blackAlpha', 'whiteAlpha')

  return (
    <Tooltip label={`${label} ${settings ? 'Enabled' : 'Disabled'}`}>
      <IconButton
        size='xs'
        icon={icon}
        colorScheme={settings ? 'blue' : scanColor}
      />
    </Tooltip>
  )
}

const ProductDetailsMain = () => {
  const navigate = useNavigate()
  const params = useParams()
  const productId = params.productid
  const productGroupId = params.productgroupid
  const sbomId = params.sbomid
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')

  const tabs = [
    'versions',
    'vulnerabilities',
    'automation rules',
    'settings',
    'policies',
    'change log'
  ]

  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()

  const onTabChange = (value) => {
    const link = generateProductDetailPageUrlFromCurrentUrl({
      paramsObj: {
        tab: tabs[value]
      }
    })

    navigate(link)
  }

  const queryParams = useSearchParams()
  const tab = queryParams[0].get('tab')
  const activeTabNumber = Math.max(tabs.indexOf(tab), 0)

  const { totalRows, prodVulnState, dispatch, userPermissions } =
    useGlobalState()

  const {
    searchInput: vulnSearch,
    severities,
    components,
    statues,
    source,
    kev,
    epss,
    direct,
    vexComplete
  } = prodVulnState
  const { prodVulnDispatch } = dispatch
  const environment = localStorage.getItem('environment')
  const [activeEnv, setActiveEnv] = useState(productId || '')

  const product = userPermissions?.find(
    (item) => item.key === 'view_product_group'
  )
  const sbomPermission = userPermissions?.find(
    (item) => item.key === 'view_sbom'
  )
  const vulnsPermissions = useMemo(
    () => userPermissions?.find((item) => item.key === 'view_feeds'),
    [userPermissions]
  )
  const updateProduct = product?.supersededBy?.some(
    (permission) =>
      permission.key === 'update_product_group' && permission.value === true
  )
  const archiveProduct = product?.supersededBy?.some(
    (permission) =>
      permission.key === 'archive_product_group' && permission.value === true
  )
  const canCreateSBOM = useMemo(
    () =>
      sbomPermission?.supersededBy?.some(
        (permission) =>
          permission.key === 'create_sbom' && permission.value === true
      ),
    [sbomPermission]
  )
  // GET PROJECT DATA
  const { data, refetch, loading, error } = useQuery(GetProjectGroup, {
    variables: { id: productGroupId }
  })

  const { projectGroup } = data || ''
  const { name, description, enabled } = projectGroup || ''

  const {
    data: settings,
    loading: settingsLoading,
    refetch: refetchSettings
  } = useQuery(GetProjectSettings, {
    variables: { id: activeEnv }
  })

  const { projectSetting } = settings?.project || ''
  const {
    checksEnabled,
    vulnScanningEnabled,
    internalCompMatchingEnabled,
    automatedFixesEnabled
  } = projectSetting || ''

  // GET VULN DATA
  const [filters, setFilters] = useState({
    field: 'VULNS_VULN_ID',
    direction: 'DESC'
  })
  const { VULNERABILITIES } = ProductDetailsTabs
  const {
    nodes,
    paginationProps,
    reset,
    loading: globalVulnloading
  } = usePaginatatedQuery(GetGlobalVulns, {
    skip: tab === VULNERABILITIES ? false : true,
    selector: 'organization.vulns',
    variables: {
      projectGroupIds: [productGroupId],
      projectIds: [productId],
      ...filters
    }
  })

  const { POLICIES } = ProductDetailsTabs
  // GET POLICY DATA
  const {
    nodes: policyData,
    paginationProps: policyPaginationProps,
    refetch: policyRefetch,
    loading: policyloading
  } = usePaginatatedQuery(GetProjectPolicies, {
    skip: tab === POLICIES ? false : true,
    selector: 'projectPolicies',
    variables: {
      projectId: activeEnv
    }
  })
  const { SETTINGS } = ProductDetailsTabs
  const { data: mfc } = useQuery(GetOrgMfc, {
    skip: tab === SETTINGS ? false : true
  })

  const vulnEpss = (epss !== 'all' || epss !== '') && epss?.split('-')

  const range = {
    min: parseFloat(vulnEpss[0]) / 100,
    max: parseFloat(vulnEpss[1]) / 100
  }

  // GET VULN DATA
  const { refetch: vulnRefetch } = useQuery(GetVulnData, {
    skip: sbomId && vulnsPermissions?.value === true ? false : true,
    variables: {
      projectId: productId || activeEnv,
      sbomId: sbomId,
      first: totalRows,
      last: undefined,
      after: undefined,
      before: undefined,
      search: vulnSearch !== '' ? vulnSearch : undefined,
      severity: severities.length > 0 ? severities : undefined,
      source: source === true ? undefined : 'COMPONENT',
      componentName: components.length > 0 ? components : undefined,
      status: statues.length > 0 ? statues : undefined,
      kev:
        kev === 'all' || kev === '' ? undefined : kev === 'yes' ? true : false,
      epss: epss !== '' && epss !== 'all' ? range : undefined,
      direct: direct === 'direct only' ? true : undefined,
      vexComplete: vexComplete === 'all' ? undefined : false,
      field: prodVulnState.field,
      direction: prodVulnState.direction
    }
  })

  const [projectDelete] = useMutation(DeleteProjectGroup)

  const {
    isOpen: isOpenProduct,
    onOpen: onOpenProduct,
    onClose: onCloseProduct
  } = useDisclosure()
  const {
    isOpen: isOpenUpload,
    onOpen: onOpenUpload,
    onClose: onCloseUpload
  } = useDisclosure()
  const {
    isOpen: isWarningOpen,
    onOpen: onWarningOpen,
    onClose: onWarningClose
  } = useDisclosure()
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure()
  const { isOpen: isEnvOpen, onClose: onEnvClose } = useDisclosure()

  // DELETE PRODUCT
  const onProductDelete = async () => {
    await projectDelete({
      variables: { id: productGroupId }
    })
      .then((res) => res.data && onDeleteClose())
      .finally(() => navigate('/vendor/products'))
  }

  useEffect(() => {
    if (sbomId === null) {
      prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    }
  }, [prodVulnDispatch, sbomId])

  useEffect(() => {
    if (environment && data) {
      console.log('Environment changed')
      const env = data?.projectGroup?.projects.find(
        (item) => item.name === environment
      )
      setActiveEnv(env?.id)
    }
  }, [data, environment])

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
        <Text>Something went wrong</Text>
      </Card>
    )
  }

  return (
    <>
      <Flex flexDirection={'column'} alignItems={'flex-start'} gap={6}>
        {/* INFO SECTION */}
        <Card display={data ? 'block' : 'none'}>
          <CardBody>
            <Grid
              width={'100%'}
              templateColumns='repeat(12, 1fr)'
              alignItems={'top'}
              gap={10}
            >
              {/* PRODUCT INFORMATIONS */}
              <GridItem colSpan={10}>
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
                  <Flex gap={1} direction={'column'} alignItems={'flex-start'}>
                    {/* PRODUCT TITLE */}
                    <Text
                      fontWeight={'semibold'}
                      fontSize={25}
                      lineHeight={1.2}
                    >
                      {name || ''}
                    </Text>
                    {/* PRODUCT DESCRIPTION */}
                    <Text fontSize={'sm'}>{description || ''}</Text>
                    {/* SETTINGS */}
                    <Stack
                      mt={description ? 1 : 0}
                      direction='row'
                      alignItems={'center'}
                    >
                      <SettingsTag
                        icon={<Search2Icon />}
                        label={'Checks'}
                        settings={checksEnabled}
                      />
                      <SettingsTag
                        icon={<FaTag />}
                        label={'Internal Labeling'}
                        settings={internalCompMatchingEnabled}
                      />
                      <SettingsTag
                        icon={<FaBug />}
                        label={'Vulnerability Scan'}
                        settings={vulnScanningEnabled}
                      />
                      <SettingsTag
                        icon={<FaRobot />}
                        label={'Automation'}
                        settings={automatedFixesEnabled}
                      />
                    </Stack>
                  </Flex>
                </Flex>
              </GridItem>
              {/* PRODUCT ACTIONS */}
              <GridItem colSpan={2}>
                <Flex
                  direction={'row'}
                  gap={2}
                  justifyContent='flex-end'
                  ml={'auto'}
                  flexWrap={'wrap'}
                >
                  {/* Notifications */}
                  <NotificationMenuBell />
                  {/* EDIT PRODUCT */}
                  <Tooltip label='Edit Product'>
                    <IconButton
                      isDisabled={!enabled || !updateProduct || signedUrlParams}
                      colorScheme='blue'
                      onClick={onOpenProduct}
                      icon={<FaPenToSquare />}
                    />
                  </Tooltip>
                  {/* UPLOAD SBOM */}
                  <Tooltip label='Upload SBOM'>
                    <IconButton
                      isDisabled={!enabled || signedUrlParams || !canCreateSBOM}
                      colorScheme='blue'
                      onClick={onOpenUpload}
                      icon={<FaUpload />}
                    />
                  </Tooltip>
                  {/* UPDATE PRODUCT STATUS */}
                  <Tooltip
                    label={enabled ? 'Disable Product' : 'Enable Product'}
                  >
                    <IconButton
                      colorScheme={'blue'}
                      onClick={onWarningOpen}
                      isDisabled={signedUrlParams}
                      icon={enabled ? <FaToggleOff /> : <FaToggleOn />}
                    />
                  </Tooltip>
                  {/* ARCHIVE PRODUCT */}
                  <Tooltip label='Archive Product'>
                    <IconButton
                      colorScheme='red'
                      onClick={onDeleteOpen}
                      icon={<FaBoxArchive />}
                      isDisabled={!archiveProduct || signedUrlParams}
                    />
                  </Tooltip>
                </Flex>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>
        {/* PRODUCT GRAPHS */}
        <ProductGraphs />
        {/* TAB SECTION */}
        <Card display={data ? 'block' : 'none'}>
          <CardBody>
            <Tabs
              w={'100%'}
              index={activeTabNumber}
              onChange={onTabChange}
              variant='enclosed'
            >
              <TabList>
                {tabs.map((item, index) => (
                  <Tab
                    key={index}
                    _focus={{ outline: 'none' }}
                    textTransform={'capitalize'}
                  >
                    {item}
                  </Tab>
                ))}
              </TabList>
              <TabPanels>
                {/* VERSIONS */}
                <TabPanel px={0}>
                  <VersionsTable
                    productId={activeEnv}
                    projectGroup={projectGroup}
                    getVulnData={vulnRefetch}
                  />
                </TabPanel>
                {/* VULNERABILITIES */}
                <TabPanel px={0}>
                  {!settingsLoading && (
                    <Tag
                      size='sm'
                      mb={4}
                      colorScheme='orange'
                      hidden={vulnScanningEnabled}
                    >
                      Automatic vulnerabilty scan is disabled under Product
                      Settings
                    </Tag>
                  )}
                  <GlobalVulnTable
                    loading={globalVulnloading}
                    vulns={nodes}
                    paginationProps={paginationProps}
                    filters={filters}
                    setFilters={(newFilters) => {
                      setFilters(newFilters)
                      reset()
                    }}
                  />
                </TabPanel>
                {/* AUTOMATIONS */}
                <TabPanel px={0}>
                  <Tag
                    size='sm'
                    colorScheme='orange'
                    hidden={automatedFixesEnabled}
                    mb={4}
                  >
                    Automation is disabled under Product Settings
                  </Tag>
                  <Automation />
                </TabPanel>
                {/* SETTINGS */}
                <TabPanel px={0}>
                  <Settings
                    data={projectSetting}
                    enabled={projectGroup?.enabled}
                    mfc={mfc?.organizationManufacturers}
                    refetch={refetchSettings}
                  />
                </TabPanel>
                {/* POLICIES */}
                <TabPanel px={0}>
                  <PolicyTable
                    data={policyData}
                    loading={policyloading}
                    refetch={policyRefetch}
                    paginationProps={policyPaginationProps}
                  />
                </TabPanel>
                {/* CHANGE LOG */}
                <TabPanel px={0}>
                  <ChangelogTable activeEnv={productId} />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </Flex>

      {/* CREATE PRODUCT */}
      {data && isOpenProduct && (
        <ProductModal
          onClose={onCloseProduct}
          isOpen={isOpenProduct}
          data={projectGroup}
        />
      )}

      {/* UPLOAD SBOM */}
      {isOpenUpload && data && (
        <UploadModal
          data={projectGroup}
          isOpen={isOpenUpload}
          onClose={onCloseUpload}
          activeEnv={activeEnv}
        />
      )}

      {/* DISABLED */}
      {isWarningOpen && data && (
        <StatusModal
          isOpen={isWarningOpen}
          onClose={onWarningClose}
          group={projectGroup}
          grouId={productId}
          refetch={refetch}
        />
      )}

      {/* DELETE */}
      {isDeleteOpen && (
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Archive Product</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>Archiving this product will: </Text>
              <UnorderedList>
                <Flex flexDir={'column'} gap={1} mt={4}>
                  {[
                    'remove this product, its versions and SBOMs',
                    'remove access to the product for all users',
                    'disable uploads of SBOMs to this product'
                  ].map((item, index) => (
                    <ListItem key={index}>{item}</ListItem>
                  ))}
                </Flex>
              </UnorderedList>
              <br />
              <Text mt={10}>Are you sure you wish to continue?</Text>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={onDeleteClose}>
                No
              </Button>
              <Button colorScheme='red' onClick={onProductDelete}>
                Yes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* ENV LIST */}
      {isEnvOpen && (
        <EnvironmentDrawer
          isOpen={isEnvOpen}
          onClose={onEnvClose}
          data={data}
          refetch={refetch}
          activeEnv={activeEnv}
          setActiveEnv={setActiveEnv}
        />
      )}
    </>
  )
}

export default ProductDetailsMain
