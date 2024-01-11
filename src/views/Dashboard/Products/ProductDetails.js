import {
  Badge,
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
  Box,
  Select
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import VersionTable from 'components/Tables/VersionTable'
import { useEffect } from 'react'
import {
  FaLayerGroup,
  FaPenToSquare,
  FaToggleOn,
  FaUpload,
  FaToggleOff,
  FaWindowMaximize,
  FaBoxArchive
} from 'react-icons/fa6'
import { useLocation, useNavigate } from 'react-router-dom'
import { timeSince, getFullDateAndTime, removeDuplicates } from 'utils'
import SBOM from 'views/Sbom'
import Controls from '../Automation/components/Controls'
import ChangeLog from '../Changelog'
import Settings from '../Automation/components/Settings'
import ProductModal from './components/ProductModal'
import UploadModal from './components/UploadModal'
import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import {
  GetProductInfo,
  GetProductVersions,
  GetProjectCheck,
  GetVulnData,
  GetProjectLogs
} from 'graphQL/Queries'
import { UpdateProject, DeleteProject } from 'graphQL/Mutation'
import { useGlobalState } from 'hooks/useGlobalState'
import { BsBoxFill } from 'react-icons/bs'

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
    prodLogState,
    prodVulnState,
    prodRulesState,
    dispatch,
    userPermissons
  } = useGlobalState()
  const { field, direction } = prodLogState
  const { prodCompDispatch, prodVulnDispatch } = dispatch

  const product = userPermissons?.find((item) => item.key === 'view_product')
  const archiveProduct = product?.supersededBy?.some(
    (permission) =>
      permission.key === 'archive_product' && permission.value === true
  )

  const { data, loading, error, refetch } = useQuery(GetProductInfo, {
    variables: {
      id: productId
    }
  })

  const { data: versions, refetch: sbomRefetch } = useQuery(
    GetProductVersions,
    {
      variables: {
        id: productId
      }
    }
  )

  const versionData = versions ? removeDuplicates(versions?.project?.sboms) : []

  const [getRules, { data: rules, error: rulesError }] = useLazyQuery(
    GetProjectCheck,
    {
      fetchPolicy: 'network-only'
    }
  )

  const [getLogs, { data: prodLogs }] = useLazyQuery(GetProjectLogs, {
    fetchPolicy: 'network-only'
  })

  // GET VULN DATA
  const { data: vulnData, refetch: vulnRefetch } = useQuery(GetVulnData, {
    fetchPolicy: 'network-only',
    variables: {
      projectId: productId,
      sbomId: sbomId,
      first: totalRows,
      field: prodVulnState.field,
      direction: prodVulnState.direction
    }
  })

  const [projectUpdate] = useMutation(UpdateProject, {
    onCompleted: () => refetch({ id: productId })
  })

  const [projectDelete] = useMutation(DeleteProject, {
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

  const handleTabChange = (value) => {
    localStorage.setItem('activeProdTab', value)
    setActiveProdTab(value)
  }

  // TOGGLE STATUS
  const toggleStatus = async () => {
    await projectUpdate({
      variables: {
        id: data?.project?.id,
        enabled: data.project.enabled === true ? false : true
      }
    }).then((res) => res.data && onWarningClose())
  }

  // DELETE PRODUCT
  const onProductDelete = async () => {
    await projectDelete({
      variables: {
        id: data?.project?.id
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
          id: productId,
          first: totalRows,
          field: prodRulesState.field,
          direction: prodRulesState.direction
        }
      })
    } else if (activeTab === 2) {
      setActiveProdTab(2)
    } else if (activeTab === 3) {
      setActiveProdTab(3)
      getLogs({
        variables: {
          id: productId,
          first: totalRows,
          field: field,
          direction: direction
        }
      })
    }
  }, [activeTab])

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
                            {data.project.name}
                          </Text>
                        </Stack>
                        {/* PRODUCT DESCRIPTION */}
                        <Text fontSize={'sm'} my={0.5}>
                          {data.project.description || ''}
                        </Text>
                        {/* PRODUCT LAST UPDATED AT */}
                        <Tooltip
                          placement='top'
                          label={getFullDateAndTime(data.project.updatedAt)}
                        >
                          <Text
                            fontSize='xs'
                            cursor={'pointer'}
                            width={'fit-content'}
                          >
                            Updated {timeSince(data.project.updatedAt)}
                          </Text>
                        </Tooltip>
                        {/* PRODUCT STATUS */}
                        <Badge
                          mt={1}
                          w={'fit-content'}
                          size={'sm'}
                          variant='solid'
                          colorScheme='blue'
                        >
                          {data.project.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                        {/* ADDITIONAL STATS */}
                        <Flex alignItems={'center'} gap={8} mt={5}>
                          {/*  ENV // * /}
                          /// TODO: 1.0 Add back in when ready
                          <Stat>
                            <StatNumber>3</StatNumber>
                            <StatLabel
                              _hover={{ color: 'blue.500' }}
                              cursor={'pointer'}
                              onClick={() => setActiveTab(0)}
                            >
                              Environments
                            </StatLabel>
                          </Stat>
                           */}
                          {/* VERSIONS */}
                          <Stack
                            direction={'row'}
                            alignItems={'flex-start'}
                            spacing={1}
                          >
                            <Icon
                              h={4}
                              w={4}
                              color='#777'
                              mt={1}
                              as={FaLayerGroup}
                            />
                            <Box>
                              <Badge
                                mr={1}
                                fontSize={'xl'}
                                fontWeight={'medium'}
                                bg={'none'}
                              >
                                {versionData?.length}
                              </Badge>
                              <Text
                                fontSize={'xs'}
                                cursor={'pointer'}
                                _hover={{ textDecoration: 'underline' }}
                                onClick={() => setActiveTab(0)}
                              >
                                Versions
                              </Text>
                            </Box>
                          </Stack>
                          {/* VULN * /}
                          /// TODO: 1.0 Add back in when ready
                          <Stat>
                            <StatNumber>790</StatNumber>
                            <StatLabel
                              _hover={{ color: 'blue.500' }}
                              cursor={'pointer'}
                              onClick={() => setActiveTab(1)}
                            >
                              Vulnerabilities
                            </StatLabel>
                          </Stat>
                          */}
                        </Flex>
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
                      {/* CHANGE ENVIRONMENT */}
                      <Flex flexDirection={'row'} alignItems={'center'} gap={2}>
                        <BsBoxFill size={22} color='#718096' />
                        <Select name='environment' id='environment' size='md'>
                          {[
                            'All',
                            'Development',
                            'Release',
                            'Staging',
                            'Settings'
                          ].map((item, index) => (
                            <option value={item} key={index}>
                              {item}
                            </option>
                          ))}
                        </Select>
                      </Flex>
                      {/* EDIT PRODUCT */}
                      <Tooltip label='Edit Product'>
                        <IconButton
                          isDisabled={!data.project.enabled}
                          colorScheme='blue'
                          onClick={onOpenProduct}
                          icon={<FaPenToSquare />}
                        ></IconButton>
                      </Tooltip>
                      {/* UPLOAD SBOM */}
                      <Tooltip label='Upload SBOM'>
                        <IconButton
                          isDisabled={!data.project.enabled}
                          colorScheme='blue'
                          onClick={onOpenUpload}
                          icon={<FaUpload />}
                        ></IconButton>
                      </Tooltip>
                      {/* UPDATE PRODUCT STATUS */}
                      <Tooltip
                        label={
                          data.project.enabled
                            ? 'Disable Product'
                            : 'Enable Product'
                        }
                      >
                        <IconButton
                          colorScheme={'blue'}
                          onClick={onWarningOpen}
                          icon={
                            data.project.enabled ? (
                              <FaToggleOff />
                            ) : (
                              <FaToggleOn />
                            )
                          }
                        ></IconButton>
                      </Tooltip>
                      {/* ARCHIVE PRODUCT */}
                      <Tooltip label='Archive Product'>
                        <IconButton
                          colorScheme='red'
                          onClick={onDeleteOpen}
                          icon={<FaBoxArchive />}
                          isDisabled={!archiveProduct}
                        ></IconButton>
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
                    /* 'vulnerabilities', */ 'automation',
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
                        data={data.project}
                        project={versions?.project}
                        productId={productId}
                        refetch={sbomRefetch}
                        getVulnData={vulnRefetch}
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
                    <Settings
                      data={rules?.project.autoChecks}
                      refetch={getRules}
                    />
                  </TabPanel>
                  {/* SETTINGS */}
                  <TabPanel>
                    <Controls />
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
            id={data.project.id}
            isOpen={isOpenProduct}
            onClose={onCloseProduct}
            product={data.project.name}
            refetch={refetch}
            description={data.project.description}
          />
        )}

        {/* UPLOAD SBOM */}
        {isOpenUpload && data && (
          <UploadModal
            id={data.project.id}
            isOpen={isOpenUpload}
            onClose={onCloseUpload}
          />
        )}

        {/* DISABLED */}
        {isWarningOpen && data && (
          <Modal isOpen={isWarningOpen} onClose={onWarningClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                {data.project.enabled ? 'Disable' : 'Enable'} Product
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text>
                  {data.project.enabled ? 'Disable' : 'Enable'} this product
                  will:{' '}
                </Text>
                <UnorderedList>
                  <Flex flexDir={'column'} gap={1} mt={4}>
                    {[
                      `${
                        data.project.enabled ? 'Disable' : 'Enable'
                      } this product, its versions and SBOMs`,
                      `${
                        data.project.enabled ? 'Disable' : 'Enable'
                      } access to the product for all users`,
                      `${
                        data.project.enabled ? 'Disable' : 'Enable'
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
                  colorScheme={data.project.enabled ? 'red' : 'green'}
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
      </>
    )
  }
}

export default ProductDetails
