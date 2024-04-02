import { Flex, Grid, GridItem, Icon, IconButton, Skeleton, Stack, Tab, TabList, TabPanel, TabPanels, Tabs, Text, Tooltip, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, UnorderedList, ListItem, Button } from '@chakra-ui/react'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import VersionsTable from 'components/Tables/VersionsTable'
import { useEffect, useMemo, useState } from 'react'
import { FaPenToSquare, FaToggleOn, FaUpload, FaToggleOff, FaWindowMaximize, FaBoxArchive, } from 'react-icons/fa6'
import { useLocation, useNavigate } from 'react-router-dom'
import SBOM from 'views/Sbom'
import ChangeLog from '../Changelog'
import Automation from '../Automation'
import ProductModal from './components/ProductModal'
import UploadModal from './components/UploadModal'
import { useGlobalState } from 'hooks/useGlobalState'
import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import { DeleteProjectGroup } from 'graphQL/Mutation'
import { GetProjectCheck, GetVulnData, GetProjectLogs, GetProjectSettings, GetProjectGroup, GetGlobalVulnData, GetGlobalVulns, GetProjectPolicies } from 'graphQL/Queries'
import Settings from '../ProductSettings'
import EnvironmentDrawer from 'components/Drawer/EnvironmentDrawer'
import GlobalVulnTable from 'components/Tables/GlobalVulnTable'
import StatusModal from './components/StatusModal'
import VulnInfo from '../Vulnerabilities/vulnInfo'
import NotificationMenuBell from "../../../components/Notifications/NotificationMenuBell";
import PolicyTable from 'components/Tables/PolicyTable'

const ProductDetails = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')
  const vulnId = queryParams.get('vulnId')
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')

  const { totalRows, activeProdTab, setActiveProdTab, prodLogState, compVulnState, prodVulnState, prodRulesState, globalVulnState, dispatch, userPermissions } = useGlobalState()
  const { field, direction, searchInput, type, user, object } = prodLogState
  const { searchInput: compVulnSearch,envs,statuses,source,versions: sbomVersions, vexComplete: isCompleted } = compVulnState
  const { searchInput: vulnSearch, severities, components, statues, kev, epss, direct, vexComplete } = prodVulnState
  const { prodVulnDispatch, globalVulnDispatch } = dispatch

  const activeProd = localStorage.getItem('activeEnv')
  const group = JSON.stringify(localStorage.getItem('product'))
  const environment = localStorage.getItem('environment')
  const [activeEnv, setActiveEnv] = useState(activeProd || '')

  const product = userPermissions?.find((item) => item.key === 'view_product_group')
  const sbomPermission = userPermissions?.find((item) => item.key === 'view_sbom')
  const vulnsPermissions = useMemo(() => userPermissions?.find((item) => item.key === 'view_feeds'), [userPermissions])
  const updateProduct = product?.supersededBy?.some((permission) =>permission.key === 'update_product_group' && permission.value === true)
  const archiveProduct = product?.supersededBy?.some((permission) =>permission.key === 'archive_product_group' && permission.value === true)
  const canCreateSBOM = useMemo(() => sbomPermission?.supersededBy?.some((permission) => permission.key === 'create_sbom' && permission.value === true), [sbomPermission] )
  // GET PROJECT DATA
  const { data, refetch, loading, error } = useQuery(GetProjectGroup, { fetchPolicy: 'network-only', variables: { id: productId } })

  const epssRange = globalVulnState.epss !== 'all' && globalVulnState.epss !== '' && globalVulnState.epss?.split('-')
  const vulnRange = { min: parseFloat(epssRange[0]) / 100, max: parseFloat(epssRange[1]) / 100 }
  // GET VULN DATA
  const [getVulns, { data: globalVulnData }] = useLazyQuery(GetGlobalVulns, { fetchPolicy: 'network-only' })
   // GET POLICY DATA
   const [getPolicyData, { data: policyData }] = useLazyQuery(GetProjectPolicies, {fetchPolicy: 'network-only'})

  const { data: rules, refetch: getRules } = useQuery(GetProjectCheck, {
    fetchPolicy: 'network-only',
    skip: activeProdTab === 2 ? false : true,
    variables: {
      id: activeEnv,
      first: totalRows,
      field: prodRulesState.field,
      direction: prodRulesState.direction
    }
  })

  const [getSettings, { data: settings }] = useLazyQuery(GetProjectSettings, {
    skip: activeProdTab === 3 ? false : true,
    fetchPolicy: 'network-only'
  })

  const [getLogs, { data: prodLogs }] = useLazyQuery(GetProjectLogs, {
    skip: activeProdTab === 4 ? false : true,
    fetchPolicy: 'network-only'
  })

  const vulnEpss = (epss !== 'all' || epss !== '') && epss?.split('-')

  const range = {
    min: parseFloat(vulnEpss[0]) / 100,
    max: parseFloat(vulnEpss[1]) / 100
  }

  // GET VULN DATA
  const { data: vulnData, refetch: vulnRefetch } = useQuery(GetVulnData, {
    skip: sbomId && vulnsPermissions?.value === true ? false : true,
    fetchPolicy: 'network-only',
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
      kev: kev === 'all' || kev === '' ? undefined : kev === 'yes' ? true : false,
      epss: epss !== '' && epss !== 'all' ? range : undefined,
      direct: direct === true ? true : undefined,
      vexComplete: vexComplete === true ? true : undefined,
      field: prodVulnState.field,
      direction: prodVulnState.direction
    }
  })

  const [projectDelete] = useMutation(DeleteProjectGroup, {
    onCompleted: () => refetch({ id: productId })
  })

  const { data: vulnInfo, refetch: getVulnData } = useQuery(GetGlobalVulnData, {
    skip: vulnId && vulnsPermissions?.value === true ? false : true,
    fetchPolicy: 'cache-first',
    variables: {
      id: vulnId,
      first: totalRows,
      projectIds: [activeEnv],
      projectGroupIds: [productId],
      search: compVulnSearch !== '' ? compVulnSearch : undefined,
      projectNames: envs?.length === 0 ? undefined : envs,
      versions: sbomVersions?.length === 0 ? undefined : sbomVersions,
      statuses: statuses?.length === 0 ? undefined : statuses,
      vexComplete: isCompleted === true ? true : undefined
    }
  })

  const activeTab = Number(localStorage.getItem('activeProdTab'))

  const { isOpen: isOpenProduct, onOpen: onOpenProduct, onClose: onCloseProduct } = useDisclosure()
  const { isOpen: isOpenUpload, onOpen: onOpenUpload, onClose: onCloseUpload } = useDisclosure()
  const { isOpen: isWarningOpen, onOpen: onWarningOpen, onClose: onWarningClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const { isOpen: isEnvOpen, onOpen: onEnvOpen, onClose: onEnvClose } = useDisclosure()

  const handleTabChange = (value) => {
    localStorage.setItem('activeProdTab', value)
    setActiveProdTab(value)
  }

  // ON CHANGE ENV
  const onChangeEnv = (value) => {
    globalVulnDispatch({ type: 'FETCH_DATA_SUCCESS' })
    localStorage.setItem('activeEnv', value)
    setActiveEnv(value)
  }

  // DELETE PRODUCT
  const onProductDelete = async () => {
    await projectDelete({
      variables: { id: productId }
    })
      .then((res) => res.data && onDeleteClose())
      .finally(() => navigate('/vendor/products'))
  }

  const defaultEnv = data && activeEnv ? data?.projectGroup?.projects.find((item) => item.id === activeEnv)?.name : ''

  useEffect(() => {
    if (sbomId === null) {
      prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
      globalVulnDispatch({ type: 'CLEAR_GLOBAL_VULN' })
    }
  }, [sbomId])

  useEffect(() => {
    if (activeTab === 0) {
      setActiveProdTab(0)
    } else if (activeTab === 1) {
      setActiveProdTab(1)
      getVulns({
        variables: {
          first: totalRows,
          projectIds: [activeEnv],
          projectGroupIds: [productId],
          field: globalVulnState.field,
          direction: globalVulnState.direction,
          search: globalVulnState.searchInput !== '' ? globalVulnState.searchInput : undefined,
          severity: globalVulnState.severities?.length === 0 ? undefined : globalVulnState.severities,
          status: globalVulnState.statues?.length === 0 ? undefined : globalVulnState.statues,
          kev: globalVulnState.kev === 'yes' ? true : globalVulnState.kev === 'false' ? false : undefined,
          epss: globalVulnState.epss === 'all' || globalVulnState.epss === '' ? undefined : vulnRange
        }
      })
    } else if (activeTab === 2) {
      setActiveProdTab(2)
    } else if (activeTab === 3) {
      setActiveProdTab(3)
      getSettings({
        variables: { id: activeEnv }
      })
    } else if (activeTab === 4) {
      setActiveProdTab(4)
      getPolicyData({ variables: { projectId: activeEnv, first: totalRows }})
      .then((res) => console.log(res?.data))
    } else if (activeTab === 5) {
      setActiveProdTab(5)
      getLogs({
        variables: {
          search: searchInput !== '' ? searchInput : undefined,
          changeType: type?.length === 0 ? undefined : type,
          changedBy: user?.length === 0 ? undefined : user,
          changeObject: object?.length === 0 ? undefined : object,
          id: activeEnv,
          first: totalRows,
          field: field,
          direction: direction
        }
      })
    }
  }, [activeTab, activeEnv])

  useEffect(() => {
    if (environment && data) {
      console.log('Environment changed')
      const env = data?.projectGroup?.projects.find((item) => item.name === environment)
      globalVulnDispatch({ type: 'FETCH_DATA_SUCCESS' })
      localStorage.setItem('activeEnv', env?.id)
      setActiveEnv(env?.id)
    }
  }, [environment])

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
      <Card><Text>Something went wrong</Text></Card>
    )
  }

  if (sbomId) {
    return (
      <SBOM prodRefetch={refetch} vulnData={vulnData} getVulnData={vulnRefetch} />
    )
  }

  if (vulnId) {
    return (
      <VulnInfo data={vulnInfo?.vuln} componentVulns={vulnInfo?.componentVulns} refetch={getVulnData} />
    )
  }

  return (
    <>
      <Flex flexDirection={'column'} alignItems={'flex-start'} gap={6}>
        {/* INFO SECTION */}
        <Card>
          <CardBody>
            {data && (
              <Grid width={'100%'} templateColumns='repeat(5, 1fr)' alignItems={'top'} gap={10} >
                {/* PRODUCT INFORMATIONS */}
                <GridItem colSpan={3}>
                  <Flex direction={'row'} alignItems={'flex-start'} gap={5} width={'100%'} >
                    <Icon as={FaWindowMaximize} h={'64px'} w={'64px'} color='blue.300' />
                    <Flex direction={'column'} gap={0.5}>
                      {/* PRODUCT TITLE */}
                      <Stack direction={'column'} spacing={1} alignItems={'left'} >
                        <Text fontWeight={'semibold'} fontSize={25} lineHeight={1.2}>
                          {data?.projectGroup?.name || ''}
                        </Text>
                      </Stack>
                      {/* PRODUCT DESCRIPTION */}
                      <Text fontSize={'sm'}>{data?.projectGroup?.description || ''}</Text>
                    </Flex>
                  </Flex>
                </GridItem>
                {/* PRODUCT ACTIONS */}
                <GridItem colSpan={2}>
                  <Flex direction={'row'} gap={2} justifyContent='flex-end' ml={'auto'} flexWrap={'wrap'}>
                    {/* Notifications */}
                    <NotificationMenuBell/>
                    {/* EDIT PRODUCT */}
                    <Tooltip label='Edit Product'>
                      <IconButton isDisabled={!data?.projectGroup?.enabled || !updateProduct || signedUrlParams } colorScheme='blue' onClick={onOpenProduct} icon={<FaPenToSquare />} />
                    </Tooltip>
                    {/* UPLOAD SBOM */}
                    <Tooltip label='Upload SBOM'>
                      <IconButton isDisabled={!data?.projectGroup?.enabled || signedUrlParams || !canCreateSBOM} colorScheme='blue' onClick={onOpenUpload} icon={<FaUpload />} />
                    </Tooltip>
                    {/* UPDATE PRODUCT STATUS */}
                    <Tooltip label={data?.projectGroup?.enabled ? 'Disable Product' : 'Enable Product' }>
                      <IconButton colorScheme={'blue'} onClick={onWarningOpen} isDisabled={signedUrlParams} icon={data?.projectGroup?.enabled ? (<FaToggleOff />) : (<FaToggleOn />)} />
                    </Tooltip>
                    {/* ARCHIVE PRODUCT */}
                    <Tooltip label='Archive Product'>
                      <IconButton colorScheme='red' onClick={onDeleteOpen} icon={<FaBoxArchive />} isDisabled={!archiveProduct || signedUrlParams} />
                    </Tooltip>
                  </Flex>
                </GridItem>
              </Grid>
            )}
          </CardBody>
        </Card>
        {/* TAB SECTION */}
        <Card>
          <CardBody>
            <Tabs variant='enclosed' w={'100%'} bg={'white'} index={activeProdTab} onChange={(value) => handleTabChange(value)}>
              <TabList>
                {['versions','vulnerabilities','automation rules','settings','policies','change log']
                .map((item, index) => (
                  <Tab key={index} _focus={{ outline: 'none' }} textTransform={'capitalize'} isDisabled={signedUrlParams && (item === 'automation rules' || item === 'settings' || item === 'change log')}>
                    {item}
                  </Tab>
                ))}
              </TabList>
              <TabPanels>
                {/* VERSIONS */}
                <TabPanel px={0}>
                  {data && (
                    <VersionsTable productId={activeEnv} projectGroup={data?.projectGroup} getVulnData={vulnRefetch} />
                  )}
                </TabPanel>
                {/* VULNERABILITIES */}
                <TabPanel px={0}>
                  <GlobalVulnTable data={globalVulnData?.organization?.vulns} refetch={getVulns} activeEnv={activeEnv} productId={productId} />
                </TabPanel>
                {/* AUTOMATIONS */}
                <TabPanel px={0}>
                  <Automation data={rules?.project?.autoChecks} refetch={getRules} />
                </TabPanel>
                {/* SETTINGS */}
                <TabPanel px={0}>
                  <Settings data={settings?.project?.projectSetting} enabled={data?.projectGroup?.enabled} activeEnv={activeEnv} refetch={getSettings} />
                </TabPanel>
                {/* POLICIES */}
                <TabPanel px={0}>
                  <PolicyTable data={policyData?.projectPolicies} refetch={getPolicyData} />
                </TabPanel>
                {/* CHANGE LOG */}
                <TabPanel px={0}>
                  <ChangeLog data={prodLogs} refetch={getLogs} activeEnv={activeProd} />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </Flex>

      {/* CREATE PRODUCT */}
      {data && isOpenProduct && (
        <ProductModal
          description={data?.projectGroup?.description}
          product={data?.projectGroup?.name}
          id={data?.projectGroup?.id}
          onClose={onCloseProduct}
          isOpen={isOpenProduct}
          refetch={refetch}
        />
      )}

      {/* UPLOAD SBOM */}
      {isOpenUpload && data && (
        <UploadModal
          data={data?.projectGroup}
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
          group={data?.projectGroup}
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
                  {['remove this product, its versions and SBOMs','remove access to the product for all users','disable uploads of SBOMs to this product'].map((item, index) => (
                    <ListItem key={index}>{item}</ListItem>
                  ))}
                </Flex>
              </UnorderedList>
              <br />
              <Text mt={10}>Are you sure you wish to continue?</Text>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={onDeleteClose}>No</Button>
              <Button colorScheme='red' onClick={onProductDelete}>Yes</Button>
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

export default ProductDetails
