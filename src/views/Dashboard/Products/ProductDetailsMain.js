import { gql, useMutation, useQuery } from '@apollo/client'
import { useTour } from '@reactour/tour'
import { addDays, differenceInDays, parseISO } from 'date-fns'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { truncatedValue } from 'utils'
import { ProductDetailsTabs } from 'utils/TabsObjects'

import { Search2Icon } from '@chakra-ui/icons'
import {
  Flex,
  Grid,
  GridItem,
  Icon,
  IconButton,
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
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import EnvironmentDrawer from 'components/Drawer/EnvironmentDrawer'
import EnvFilter from 'components/Misc/EnvFilter'
import NotificationMenuBell from 'components/Notifications/NotificationMenuBell'
import ChangelogTable from 'components/Tables/ChangelogTable'
import GlobalVulnTable from 'components/Tables/GlobalVulnTable'
import PolicyTable from 'components/Tables/PolicyTable'
import VersionsTable from 'components/Tables/VersionsTable'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useShouldShowDemoFeatures } from 'hooks/useShouldShowDemoFeatures'

import { DeleteProjectGroup } from 'graphQL/Mutation'
import {
  GetGlobalVulns,
  GetOrgMfc,
  GetProjectPolicies,
  GetProjectSettings,
  GetVersionsDate
} from 'graphQL/Queries'

import { FaBug, FaRobot, FaTag } from 'react-icons/fa'
import {
  FaDiagramProject,
  FaPenToSquare,
  FaToggleOff,
  FaToggleOn,
  FaTrash,
  FaUpload,
  FaWindowMaximize
} from 'react-icons/fa6'
import { IoMdWarning } from 'react-icons/io'

import Automation from '../Automation'
import Settings from '../ProductSettings'
import { ProductGraphs } from './ProductGraphs'
import ProductProgressModal from './ProductGraphs/ProductProgressModal'
import ConfirmationModal from './components/ConfirmationModal'
import ProductModal from './components/ProductModal'
import StatusModal from './components/StatusModal'
import UploadModal from './components/UploadModal'

const GetProjectGroup = gql`
  query GetProjectGroup($id: Uuid!) {
    projectGroup(id: $id) {
      id
      description
      enabled
      name
      defaultProject {
        id
      }
      projects {
        id
        name
      }
    }
  }
`

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
  const { isFreeTier } = useGlobalQueryContext()
  const navigate = useNavigate()
  const params = useParams()
  const productId = params.productid
  const productGroupId = params.productgroupid
  const sbomId = params.sbomid
  const { setIsOpen, setCurrentStep } = useTour()
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const activeTour = localStorage.getItem('activeTour')

  const warningColor = useColorModeValue('#E53E3E', '#F56565')

  const [warning, setWarning] = useState(false)
  const [exceedingCount, setExceedingCount] = useState(0)

  const { shouldShowDemoFeatures } = useShouldShowDemoFeatures()
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()

  const onTabChange = (value) => {
    const link = generateProductDetailPageUrlFromCurrentUrl({
      paramsObj: {
        tab: tabs[value]
      }
    })
    navigate(link)
  }

  const tabs = [
    'versions',
    'vulnerabilities',
    'automation rules',
    'settings',
    'policies',
    'change log'
  ]

  const getDisplay = (item) => {
    const conditions = {
      'automation rules': isFreeTier
    }
    return conditions[item] ? 'none' : 'block'
  }

  const queryParams = useSearchParams()
  const tab = queryParams[0].get('tab')
  const activeTabNumber = Math.max(tabs.indexOf(tab), 0)

  const { dispatch, envName } = useGlobalState()

  const { prodVulnDispatch } = dispatch
  const [activeEnv, setActiveEnv] = useState(productId || '')

  const updateProduct = useHasPermission({
    parentKey: 'view_product_group',
    childKey: 'update_product_group'
  })

  const archiveProduct = useHasPermission({
    parentKey: 'view_product_group',
    childKey: 'archive_product_group'
  })

  const canCreateSBOM = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom'
  })

  // GET PROJECT DATA
  const { data, loading, error } = useQuery(GetProjectGroup, {
    variables: { id: productGroupId }
  })

  const { id, name, description, enabled, projects, defaultProject } = data?.projectGroup || ''

  const { data: settings, loading: settingsLoading } = useQuery(
    GetProjectSettings,
    {
      variables: { id: activeEnv }
    }
  )

  const { projectSetting } = settings?.project || ''
  const {
    checksEnabled,
    dataRetentionDays,
    vulnScanningEnabled,
    internalCompMatchingEnabled,
    automatedFixesEnabled
  } = projectSetting || ''

  const [versionFilters, setVersionFilters] = useState({
    field: 'SBOMS_CREATED_AT',
    direction: 'DESC'
  })

  const { data: versions } = useQuery(GetVersionsDate, {
    skip: signedUrlParams,
    fetchPolicy: 'network-only',
    variables: {
      first: 25,
      id: productId,
      ...versionFilters
    }
  })

  const { nodes: versionDates } = versions?.project?.sbomVersions || ''

  useEffect(() => {
    if (versionDates && dataRetentionDays) {
      const currentDate = new Date()
      const retentionTimeInt = Math.floor(dataRetentionDays)
      const exceedingItems = versionDates?.filter((item) => {
        const createdDate = parseISO(item?.createdAt)
        const expirationDate = addDays(createdDate, retentionTimeInt)
        const daysUntilDeletion = differenceInDays(expirationDate, currentDate)
        return (
          daysUntilDeletion <= 7 &&
          daysUntilDeletion >= 0 &&
          retentionTimeInt !== 0
        )
      })
      setExceedingCount(exceedingItems?.length)
      setWarning(exceedingItems?.length > 0)
    } else {
      setWarning(false)
    }
  }, [dataRetentionDays, versionDates])

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
  } = usePaginatedQuery(GetGlobalVulns, {
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
    loading: policyloading
  } = usePaginatedQuery(GetProjectPolicies, {
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

  const [projectDelete] = useMutation(DeleteProjectGroup)

  const PRODUCT = useDisclosure()
  const UPLOAD = useDisclosure()
  const WARNING = useDisclosure()
  const DELETE = useDisclosure()
  const PROGRESS = useDisclosure()
  const ENV = useDisclosure()

  // DELETE PRODUCT
  const onProductDelete = async () => {
    await projectDelete({
      variables: { id: productGroupId }
    })
      .then((res) => res.data && DELETE.onClose())
      .finally(() => navigate('/vendor/products'))
  }

  useEffect(() => {
    if (sbomId === null) {
      prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    }
  }, [prodVulnDispatch, sbomId])

  useEffect(() => {
    if (envName && projects) {
      const env = projects?.find((item) => item.name === envName)
      setActiveEnv(env?.id)
    }
  }, [projects, envName])

  useEffect(() => {
    if (shouldShowDemoFeatures) {
      if (activeTour === 'products') {
        document?.body?.classList.add('no-scroll')
        if (data) {
          setCurrentStep(1)
          setIsOpen(true)
        }
      } else {
        document?.body?.classList.remove('no-scroll')
        setIsOpen(false)
      }
    }
  }, [data, activeTour, setCurrentStep, setIsOpen, shouldShowDemoFeatures])

  const handleSort = (column, sortDirection) => {
    setVersionFilters((oldFilters) => ({
      ...oldFilters,
      field: column?.id,
      direction: sortDirection.toUpperCase()
    }))
  }

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
        <Card
          display={data ? 'block' : 'none'}
          className='product-details'
          minH={'100px'}
        >
          <CardBody>
            <Grid
              width={'100%'}
              templateColumns='repeat(12, 1fr)'
              alignItems={'top'}
              gap={10}
            >
              {/* PRODUCT INFORMATIONS */}
              <GridItem colSpan={8}>
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
                      fontSize={22}
                      lineHeight={1.2}
                    >
                      <Tooltip label={name}>{truncatedValue(name, 50)}</Tooltip>
                    </Text>
                    {/* PRODUCT DESCRIPTION */}
                    <Text fontSize={'sm'} wordBreak={'break-all'}>
                      {description || ''}
                    </Text>
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
                      {warning && (
                        <Tooltip
                          label={`${exceedingCount} SBOM${exceedingCount > 1 ? 's are' : ' is'} marked for deletion in the next 7 days. This is based on the data retention under Settings tab.`}
                        >
                          <IconButton
                            size='xs'
                            color={warningColor}
                            icon={<IoMdWarning size={16} />}
                            onClick={() =>
                              handleSort({ id: 'SBOMS_CREATED_AT' }, 'desc')
                            }
                            bg='transparent'
                          />
                        </Tooltip>
                      )}
                    </Stack>
                  </Flex>
                </Flex>
              </GridItem>
              {/* PRODUCT ACTIONS */}
              <GridItem colSpan={4}>
                <Flex alignItems={'flex-end'} flexDir={'column'} gap={3}>
                  <EnvFilter />
                  <Flex
                    direction={'row'}
                    gap={2}
                    justifyContent='flex-end'
                    ml={'auto'}
                    flexWrap={'wrap'}
                  >
                    {/* VIEW PRODUCT PROGRESS */}
                    {shouldShowDemoFeatures && (
                      <Tooltip label='View Product TrailLynk'>
                        <IconButton
                          icon={<FaDiagramProject />}
                          colorScheme='blue'
                          onClick={PROGRESS.onOpen}
                        />
                      </Tooltip>
                    )}
                    {/* Notifications */}
                    <NotificationMenuBell />
                    {/* EDIT PRODUCT */}
                    <Tooltip label='Edit Product'>
                      <IconButton
                        isDisabled={
                          !enabled || !updateProduct || signedUrlParams
                        }
                        colorScheme='blue'
                        onClick={PRODUCT.onOpen}
                        icon={<FaPenToSquare />}
                      />
                    </Tooltip>
                    {/* UPLOAD SBOM */}
                    <Tooltip label='Upload SBOM'>
                      <IconButton
                        isDisabled={
                          !enabled || signedUrlParams || !canCreateSBOM
                        }
                        colorScheme='blue'
                        onClick={UPLOAD.onOpen}
                        icon={<FaUpload />}
                      />
                    </Tooltip>
                    {/* UPDATE PRODUCT STATUS */}
                    <Tooltip
                      label={enabled ? 'Disable Product' : 'Enable Product'}
                    >
                      <IconButton
                        colorScheme={'blue'}
                        onClick={WARNING.onOpen}
                        isDisabled={signedUrlParams || !updateProduct}
                        icon={enabled ? <FaToggleOff /> : <FaToggleOn />}
                      />
                    </Tooltip>
                    {/* ARCHIVE PRODUCT */}
                    <Tooltip label='Delete Product'>
                      <IconButton
                        colorScheme='red'
                        onClick={DELETE.onOpen}
                        icon={<FaTrash />}
                        isDisabled={!archiveProduct || signedUrlParams}
                      />
                    </Tooltip>
                  </Flex>
                </Flex>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>
        {/* PRODUCT GRAPHS */}
        {shouldShowDemoFeatures && <ProductGraphs />}
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
                    display={getDisplay(item)}
                    _focus={{ outline: 'none' }}
                    textTransform={'capitalize'}
                    className={
                      item === 'automation rules'
                        ? 'automation-rules'
                        : item === 'versions'
                          ? ''
                          : item
                    }
                  >
                    {item}
                  </Tab>
                ))}
              </TabList>
              <TabPanels>
                {/* VERSIONS */}
                <TabPanel px={0}>
                  <VersionsTable
                    handleSort={handleSort}
                    filters={versionFilters}
                    setFilters={setVersionFilters}
                    retentionTime={dataRetentionDays}
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
                  {<Automation />}
                </TabPanel>
                {/* SETTINGS */}
                <TabPanel px={0}>
                  <Settings
                    data={projectSetting}
                    enabled={enabled}
                    mfc={mfc?.organizationManufacturers}
                  />
                </TabPanel>
                {/* POLICIES */}
                <TabPanel px={0}>
                  <PolicyTable
                    data={policyData}
                    loading={policyloading}
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
      {PRODUCT.isOpen && (
        <ProductModal
          onClose={PRODUCT.onClose}
          isOpen={PRODUCT.isOpen}
          data={{ id, name, description }}
        />
      )}

      {/* VIEW PRODUCT PROGRESS */}
      {PROGRESS.isOpen && (
        <ProductProgressModal
          onClose={PROGRESS.onClose}
          isOpen={PROGRESS.isOpen}
          name={name}
        />
      )}

      {/* UPLOAD SBOM */}
      {UPLOAD.isOpen && (
        <UploadModal
          isOpen={UPLOAD.isOpen}
          onClose={UPLOAD.onClose}
          group={{ id, name, default: defaultProject?.id }}
        />
      )}

      {/* DISABLED */}
      {WARNING.isOpen && (
        <StatusModal
          reset={reset}
          isOpen={WARNING.isOpen}
          onClose={WARNING.onClose}
          group={{ id, enabled }}
          grouId={productId}
        />
      )}

      {/* DELETE */}
      {DELETE.isOpen && (
        <ConfirmationModal
          isOpen={DELETE.isOpen}
          onClose={DELETE.onClose}
          onConfirm={onProductDelete}
          name={name}
          title='Delete Product'
          description='Deleting this product will:'
          items={[
            'Remove this product, its versions and SBOMs',
            'Remove access to the product for all users',
            'Disable uploads of SBOMs to this product'
          ]}
        />
      )}

      {/* ENV LIST */}
      {ENV.isOpen && (
        <EnvironmentDrawer
          isOpen={ENV.isOpen}
          onClose={ENV.onClose}
          data={data}
          activeEnv={activeEnv}
          setActiveEnv={setActiveEnv}
        />
      )}
    </>
  )
}

export default ProductDetailsMain
