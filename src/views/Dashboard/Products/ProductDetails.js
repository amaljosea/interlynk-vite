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
  Text,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  UnorderedList,
  ListItem,
  Button,
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuOptionGroup,
  MenuDivider
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import VersionTable from 'components/Tables/VersionTable'
import { useEffect, useState } from 'react'
import {
  FaPenToSquare,
  FaToggleOn,
  FaUpload,
  FaToggleOff,
  FaWindowMaximize,
  FaBoxArchive
} from 'react-icons/fa6'
import { useLocation, useNavigate } from 'react-router-dom'
import { removeDuplicates } from 'utils'
import SBOM from 'views/Sbom'
import ChangeLog from '../Changelog'
import Automation from '../Automation'
import ProductModal from './components/ProductModal'
import UploadModal from './components/UploadModal'
import { useGlobalState } from 'hooks/useGlobalState'
import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import { DeleteProjectGroup, UpdateProjectGroup } from 'graphQL/Mutation'
import {
  GetProductVersions,
  GetProjectCheck,
  GetVulnData,
  GetProjectLogs,
  GetProjectGroups,
  GetProjectSettings
} from 'graphQL/Queries'
import Settings from '../ProductSettings'
import CardHeader from 'components/Card/CardHeader'
import { ChevronDownIcon, ViewIcon } from '@chakra-ui/icons'
import EnvironmentDrawer from 'components/Drawer/EnvironmentDrawer'

const ProductDetails = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')

  const {
    totalRows,
    activeProdTab,
    setActiveProdTab,
    prodState,
    prodLogState,
    prodVulnState,
    prodRulesState,
    dispatch,
    userPermissions
  } = useGlobalState()
  const { field, direction } = prodLogState
  const { enabled } = prodState
  const { prodVulnDispatch } = dispatch

  const activeProd = localStorage.getItem('activeEnv')
  const [activeEnv, setActiveEnv] = useState(activeProd || '')

  const product = userPermissions?.find(
    (item) => item.key === 'view_product_group'
  )
  const updateProduct = product?.supersededBy?.some(
    (permission) =>
      permission.key === 'update_product_group' && permission.value === true
  )
  const archiveProduct = product?.supersededBy?.some(
    (permission) =>
      permission.key === 'archive_product_group' && permission.value === true
  )

  const { data, refetch, loading, error } = useQuery(GetProjectGroups, {
    variables: {
      first: totalRows,
      enabled: enabled === 'yes' ? true : enabled === 'no' ? false : undefined,
      field: prodState.field,
      direction: prodState.direction
    },
    onCompleted: (data) => {
      if (data) {
        const activeGroup = data?.organization?.projectGroups?.nodes.find(
          (item) => item.id === productId
        )
        localStorage.setItem('activeEnv', activeGroup?.defaultProject?.id)
        setActiveEnv(activeGroup?.defaultProject?.id)
      }
    }
  })

  const activeGroup =
    data &&
    data?.organization?.projectGroups?.nodes.find(
      (item) => item.id === productId
    )

  const { data: versions, refetch: sbomRefetch } = useQuery(
    GetProductVersions,
    {
      variables: {
        id: activeEnv
      }
    }
  )

  // const versionData = versions ? removeDuplicates(versions?.project?.sboms) : []

  const [getRules, { data: rules, error: rulesError }] = useLazyQuery(
    GetProjectCheck,
    { fetchPolicy: 'network-only' }
  )

  const [getSettings, { data: settings }] = useLazyQuery(GetProjectSettings, {
    fetchPolicy: 'network-only',
    variables: {
      id: activeEnv
    }
  })

  const [getLogs, { data: prodLogs }] = useLazyQuery(GetProjectLogs, {
    fetchPolicy: 'network-only'
  })

  // GET VULN DATA
  const { data: vulnData, refetch: vulnRefetch } = useQuery(GetVulnData, {
    fetchPolicy: 'network-only',
    variables: {
      projectId: activeEnv,
      sbomId: sbomId,
      first: totalRows,
      field: prodVulnState.field,
      direction: prodVulnState.direction
    }
  })

  const [projectUpdate] = useMutation(UpdateProjectGroup, {
    onCompleted: () => refetch({ id: productId })
  })

  const [projectDelete] = useMutation(DeleteProjectGroup, {
    onCompleted: () => refetch({ id: productId })
  })

  const activeTab = Number(localStorage.getItem('activeProdTab'))

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

  const {
    isOpen: isEnvOpen,
    onOpen: onEnvOpen,
    onClose: onEnvClose
  } = useDisclosure()

  const handleTabChange = (value) => {
    localStorage.setItem('activeProdTab', value)
    setActiveProdTab(value)
  }

  // ON CHANGE ENV
  const onChangeEnv = (value) => {
    localStorage.setItem('activeEnv', value)
    setActiveEnv(value)
  }

  // TOGGLE STATUS
  const toggleStatus = async () => {
    await projectUpdate({
      variables: {
        id: activeGroup?.id,
        enabled: activeGroup?.enabled === true ? false : true
      }
    }).then((res) => res.data && onWarningClose())
  }

  // DELETE PRODUCT
  const onProductDelete = async () => {
    await projectDelete({
      variables: {
        id: activeGroup?.id
      }
    })
      .then((res) => res.data && onDeleteClose())
      .finally(() => navigate('/vendor/products'))
  }

  useEffect(() => {
    if (sbomId === null) {
      prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    }
  }, [sbomId])

  useEffect(() => {
    if (activeTab === 0) {
      setActiveProdTab(0)
    } else if (activeTab === 1) {
      setActiveProdTab(1)
      getRules({
        variables: {
          id: activeEnv,
          first: totalRows,
          field: prodRulesState.field,
          direction: prodRulesState.direction
        }
      }).then((res) => console.log('res', res.data))
    } else if (activeTab === 2) {
      setActiveProdTab(2)
      getSettings({
        variables: { id: activeEnv }
      })
    } else if (activeTab === 3) {
      setActiveProdTab(3)
      getLogs({
        variables: {
          id: activeEnv,
          first: totalRows,
          field: field,
          direction: direction
        }
      })
    }
  }, [activeTab, activeEnv])

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

  if (sbomId) {
    return (
      <SBOM
        prodRefetch={refetch}
        vulnData={vulnData}
        getVulnData={vulnRefetch}
      />
    )
  } else {
    return (
      <>
        <Flex flexDirection={'column'} alignItems={'flex-start'} gap={6}>
          {/* INFO SECTION */}
          <Card>
            <CardBody>
              {data && (
                <Grid
                  width={'100%'}
                  templateColumns='repeat(5, 1fr)'
                  alignItems={'top'}
                  gap={10}
                >
                  {/* PRODUCT INFORMATIONS */}
                  <GridItem colSpan={3}>
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
                      <Flex direction={'column'} gap={0.5}>
                        {/* PRODUCT TITLE */}
                        <Stack
                          direction={'column'}
                          spacing={1}
                          alignItems={'left'}
                        >
                          <Text fontWeight={'semibold'} fontSize={25}>
                            {activeGroup?.name || ''}
                          </Text>
                        </Stack>
                        {/* PRODUCT DESCRIPTION */}
                        <Text fontSize={'sm'}>
                          {activeGroup?.description || ''}
                        </Text>
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
                      {/* EDIT PRODUCT */}
                      <Tooltip label='Edit Product'>
                        <IconButton
                          isDisabled={!activeGroup?.enabled || !updateProduct}
                          colorScheme='blue'
                          onClick={onOpenProduct}
                          icon={<FaPenToSquare />}
                        />
                      </Tooltip>
                      {/* UPLOAD SBOM */}
                      <Tooltip label='Upload SBOM'>
                        <IconButton
                          isDisabled={!activeGroup?.enabled}
                          colorScheme='blue'
                          onClick={onOpenUpload}
                          icon={<FaUpload />}
                        />
                      </Tooltip>
                      {/* UPDATE PRODUCT STATUS */}
                      <Tooltip
                        label={
                          activeGroup?.enabled
                            ? 'Disable Product'
                            : 'Enable Product'
                        }
                      >
                        <IconButton
                          colorScheme={'blue'}
                          onClick={onWarningOpen}
                          icon={
                            activeGroup?.enabled ? (
                              <FaToggleOff />
                            ) : (
                              <FaToggleOn />
                            )
                          }
                        />
                      </Tooltip>
                      {/* ARCHIVE PRODUCT */}
                      <Tooltip label='Archive Product'>
                        <IconButton
                          colorScheme='red'
                          onClick={onDeleteOpen}
                          icon={<FaBoxArchive />}
                          isDisabled={!archiveProduct}
                        />
                      </Tooltip>
                    </Flex>
                  </GridItem>
                </Grid>
              )}
            </CardBody>
          </Card>
          {/* TAB SECTION */}
          <Card>
            <CardHeader>
              <Flex width={'100%'} justifyContent={'flex-end'}>
                {/* CHANGE ENVIRONMENT */}
                <Menu>
                  <MenuButton
                    as={Button}
                    variant={'solid'}
                    colorScheme='blue'
                    fontSize={'sm'}
                    textTransform={'capitalize'}
                    rightIcon={<ChevronDownIcon />}
                  >
                    {activeEnv
                      ? activeGroup?.projects?.find(
                          (item) => item.id === activeEnv
                        )?.name
                      : 'Default'}
                  </MenuButton>
                  <MenuList>
                    <MenuOptionGroup
                      type='radio'
                      value={activeEnv}
                      onChange={onChangeEnv}
                    >
                      {activeGroup?.projects?.map((item) => (
                        <MenuItemOption
                          fontSize={'sm'}
                          value={item?.id}
                          key={item?.id}
                          textTransform={'capitalize'}
                        >
                          {item?.name}
                        </MenuItemOption>
                      ))}
                      <MenuDivider />
                      <MenuItem
                        fontSize={'sm'}
                        icon={<ViewIcon />}
                        onClick={() => onEnvOpen()}
                      >
                        View all environments
                      </MenuItem>
                    </MenuOptionGroup>
                  </MenuList>
                </Menu>
              </Flex>
            </CardHeader>
            <CardBody mt={6}>
              <Tabs
                variant='enclosed'
                w={'100%'}
                bg={'white'}
                index={activeProdTab}
                onChange={(value) => handleTabChange(value)}
              >
                <TabList>
                  {[
                    'versions',
                    ,
                    /// TODO: 1.0 Add back in when ready
                    /* 'vulnerabilities', */ 'automation rules',
                    'settings',
                    'change log'
                  ].map((item, index) => (
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
                  <TabPanel>
                    {data && (
                      <VersionTable
                        productId={activeEnv}
                        project={versions?.project}
                        data={activeGroup}
                        getVulnData={vulnRefetch}
                        refetch={sbomRefetch}
                      />
                    )}
                  </TabPanel>
                  {/* VULNERABILITIES * /}
                  /// TODO: 1.0 Add back in when ready
                  <TabPanel>
                    <VulnsTable data={vulnList} />
                  </TabPanel>
                  * /}
                  {/* AUTOMATIONS */}
                  <TabPanel>
                    {rulesError && (
                      <Text textAlign={'center'} my={6}>
                        {JSON.stringify(rulesError)}
                      </Text>
                    )}
                    <Automation
                      data={rules?.project.autoChecks}
                      refetch={getRules}
                    />
                  </TabPanel>
                  {/* SETTINGS */}
                  <TabPanel>
                    <Settings
                      projectId={activeGroup?.defaultProject?.id}
                      data={settings?.project?.projectSetting}
                      enabled={activeGroup?.enabled}
                      refetch={getSettings}
                    />
                  </TabPanel>
                  {/* CHANGE LOG */}
                  <TabPanel>
                    <ChangeLog data={prodLogs} refetch={getLogs} />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        </Flex>

        {/* CREATE PRODUCT */}
        {data && isOpenProduct && (
          <ProductModal
            description={activeGroup?.description}
            product={activeGroup?.name}
            id={activeGroup?.id}
            onClose={onCloseProduct}
            isOpen={isOpenProduct}
            refetch={refetch}
          />
        )}

        {/* UPLOAD SBOM */}
        {isOpenUpload && data && (
          <UploadModal
            projects={activeGroup?.projects}
            isOpen={isOpenUpload}
            onClose={onCloseUpload}
            activeEnv={activeEnv}
          />
        )}

        {/* DISABLED */}
        {isWarningOpen && data && (
          <Modal isOpen={isWarningOpen} onClose={onWarningClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                {activeGroup?.enabled ? 'Disable' : 'Enable'} Product
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text>
                  {activeGroup?.enabled ? 'Disable' : 'Enable'} this product
                  will:{' '}
                </Text>
                <UnorderedList>
                  <Flex flexDir={'column'} gap={1} mt={4}>
                    {[
                      `${
                        activeGroup?.enabled ? 'Disable' : 'Enable'
                      } this product, its versions and SBOMs`,
                      `${
                        activeGroup?.enabled ? 'Disable' : 'Enable'
                      } access to the product for all users`,
                      `${
                        activeGroup?.enabled ? 'Disable' : 'Enable'
                      } uploads of SBOMs to this product`
                    ].map((item, index) => (
                      <ListItem key={index}>{item}</ListItem>
                    ))}
                  </Flex>
                </UnorderedList>
                <Text mt={10}>Are you sure you wish to continue?</Text>
              </ModalBody>
              <ModalFooter>
                <Button mr={3} onClick={onWarningClose}>
                  No
                </Button>
                <Button
                  colorScheme={data?.project?.enabled ? 'red' : 'green'}
                  onClick={toggleStatus}
                >
                  Yes
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
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
            data={activeGroup}
            refetch={refetch}
            activeEnv={activeEnv}
          />
        )}
      </>
    )
  }
}

export default ProductDetails
