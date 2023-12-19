import { useQuery } from '@apollo/client'
import {
  Badge,
  Flex,
  Grid,
  GridItem,
  Icon,
  IconButton,
  Skeleton,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import VersionTable from 'components/Tables/VersionTable'
import { GetProductInfo } from 'graphQL/Queries'
import { useEffect, useState } from 'react'
import {
  FaCircleCheck,
  FaCircleExclamation,
  FaCubes,
  FaPenToSquare,
  FaScrewdriverWrench,
  FaTrashCan,
  FaUpload
} from 'react-icons/fa6'
import { useLocation } from 'react-router-dom'
import { timeSince, getFullDateAndTime } from 'utils'
import { vulnList } from 'variables/general'
import SBOM from 'views/Sbom'
import Controls from '../Automation/components/Controls'
import ChangeLog from '../Changelog'
import { GetProjectCheck } from 'graphQL/Queries'
import Settings from '../Automation/components/Settings'
import VulnsTable from 'components/Tables/VulnsTable'
import ProductModal from './components/ProductModal'
import UploadModal from './components/UploadModal'
import { GetProductVersions } from 'graphQL/Queries'

const ProductDetails = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')
  const sbomId = queryParams.get('sbom')

  const { data, loading, error, refetch } = useQuery(GetProductInfo, {
    variables: {
      id: productId
    }
  })

  const { data: versions } = useQuery(GetProductVersions, {
    variables: {
      id: productId
    }
  })

  const {
    data: rules,
    error: rulesError,
    refetcg: rulesRefetch
  } = useQuery(GetProjectCheck, {
    variables: {
      id: productId
    }
  })

  const [activeTab, setActiveTab] = useState(0)

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

  const handleTabChange = (value) => {
    setActiveTab(value)
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

  if (sbomId) {
    return <SBOM />
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
                  gap={40}
                >
                  {/* PRODUCT INFORMATIONS */}
                  <GridItem colSpan={2}>
                    <Flex
                      direction={'row'}
                      alignItems={'flex-start'}
                      gap={5}
                      width={'100%'}
                    >
                      <Icon
                        as={FaCubes}
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
                          {data.project.description}
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
                        <Flex alignItems={'center'} gap={8} mt={4}>
                          {/* ENV */}
                          <Stat>
                            <StatNumber>234</StatNumber>
                            <StatLabel>Environments</StatLabel>
                          </Stat>
                          {/* VULN */}
                          <Stat>
                            <StatNumber>110</StatNumber>
                            <StatLabel>Vulnerabilities</StatLabel>
                          </Stat>
                        </Flex>
                      </Flex>
                    </Flex>
                  </GridItem>
                  {/* PRODUCT ACTIONS */}
                  <GridItem colSpan={3}>
                    <Flex
                      direction={'row'}
                      gap={2}
                      justifyContent='flex-end'
                      ml={'auto'}
                      flexWrap={'wrap'}
                    >
                      {/* EDIT PRODUCT */}
                      <Tooltip label='Edit'>
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
                      {/* BUILD SBOM */}
                      <Tooltip label='Build SBOM'>
                        <IconButton
                          isDisabled={!data.project.enabled}
                          colorScheme='blue'
                          icon={<FaScrewdriverWrench />}
                        ></IconButton>
                      </Tooltip>
                      {/* UPDATE PRODUCT STATUS */}
                      <Tooltip label='Enabled'>
                        <IconButton
                          isDisabled={!data.project.enabled}
                          colorScheme='blue'
                          icon={
                            data.project.enabled ? (
                              <FaCircleCheck />
                            ) : (
                              <FaCircleExclamation />
                            )
                          }
                        ></IconButton>
                      </Tooltip>
                      {/* ARCHIVE PRODUCT */}
                      <Tooltip label='Archive'>
                        <IconButton
                          colorScheme='red'
                          icon={<FaTrashCan />}
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
                index={activeTab}
                onChange={(value) => handleTabChange(value)}
              >
                <TabList>
                  {[
                    'versions',
                    'vulnerabilities',
                    'automation',
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
                    {versions && data && (
                      <VersionTable
                        name={data.project.name}
                        project={versions?.project}
                        productId={productId}
                      />
                    )}
                  </TabPanel>
                  {/* VULNERABILITIES */}
                  <TabPanel>
                    <VulnsTable data={vulnList} />
                  </TabPanel>
                  {/* AUTOMATIONS */}
                  <TabPanel>
                    {rulesError && (
                      <Text textAlign={'center'} my={6}>
                        {JSON.stringify(rulesError)}
                      </Text>
                    )}

                    {rules && (
                      <Settings
                        data={rules?.project.autoChecks}
                        refetch={rulesRefetch}
                      />
                    )}
                  </TabPanel>
                  {/* SETTINGS */}
                  <TabPanel>
                    <Controls />
                  </TabPanel>
                  {/* CHANGE LOG */}
                  <TabPanel>
                    <ChangeLog />
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
            refetch={refetch}
            onClose={onCloseUpload}
          />
        )}
      </>
    )
  }
}

export default ProductDetails
