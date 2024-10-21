import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { useMemo, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import { Link, useLocation, useParams } from 'react-router-dom'
import { capitalizeFirstLetter, customStyles, envOrderList } from 'utils'
import { GetIcon, isDefaultEnv, isValidPurl, truncatedValue } from 'utils'
import { getSignedUrlParams } from 'utils'
import { ProductGeneralTabs } from 'utils/TabsObjects'

import { AddIcon } from '@chakra-ui/icons'
import {
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Select,
  SimpleGrid,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  useColorMode,
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CustomLoader from 'components/CustomLoader'
import RefreshBtn from 'components/Icons/RefreshBtn'
import LynkAlert from 'components/LynkAlert'
import LynkModal from 'components/LynkModal'
import VulnBadge from 'components/Misc/VulnBadge'

import { useGlobalState } from 'hooks/useGlobalState'
import { useGradualPolling } from 'hooks/useGradualPolling'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePartsContext } from 'hooks/usePartsContext'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { SbomPartCreate, SbomPartDelete } from 'graphQL/Mutation'
import { CheckDeepParts, GetProject } from 'graphQL/Queries'
import { GetProjectGroups, GetSbomParts } from 'graphQL/Queries'

import { BiLayerPlus } from 'react-icons/bi'
import { BsFillPatchQuestionFill } from 'react-icons/bs'
import { FaEllipsisV } from 'react-icons/fa'

import ConfirmationModal from '../components/ConfirmationModal'

const LynkSelect = ({ name, value, onChange, children }) => {
  return (
    <Select name={name} value={value} fontSize={'sm'} onChange={onChange}>
      <option value={''}>-- Select --</option>
      {children}
    </Select>
  )
}

const Parts = ({ data }) => {
  const params = useParams()
  const location = useLocation()
  const { colorMode } = useColorMode()
  const partsContext = usePartsContext()
  const sbomId = params.sbomid
  const prodId = params.productid
  const queryParams = new URLSearchParams(location.search)
  const activeTab = queryParams.get('tab')
  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()

  const isArchived = data?.lifecycle === 'archived'

  const { totalRows, prodState, dispatch } = useGlobalState()

  const {
    headingTextColor,
    primaryTextColor,
    secondaryTextColor,
    inverseSecondaryBgColor,
    primaryBlueText
  } = useThemeColor([
    'headingTextColor',
    'primaryTextColor',
    'secondaryTextColor',
    'inverseSecondaryBgColor',
    'primaryBlueText'
  ])

  const { enabled, field, direction } = prodState
  const { prodVulnDispatch } = dispatch

  const { PARTS } = ProductGeneralTabs

  // GET SBOM PARTS
  const {
    data: sbomData,
    error,
    startPolling,
    stopPolling
  } = useQuery(GetSbomParts, {
    skip: activeTab === PARTS ? false : true,
    variables: { projectId: prodId, sbomId, first: totalRows }
  })

  const { sbomParts } = sbomData?.sbom || ''

  const signedUrlParams = getSignedUrlParams()

  const updateSboms = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'update_sbom'
  })

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure()

  const addBtn = useRef()
  const [selectedProd, setSelectedProd] = useState('')
  const [selectedVersion, setSelectedVersion] = useState('')
  const [activeRow, setActiveRow] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState('')
  const [envList, setEnvList] = useState([])

  const { data: allProjects } = useQuery(GetProjectGroups, {
    skip: activeTab === PARTS ? false : true,
    variables: {
      first: totalRows,
      enabled: enabled === 'yes' ? true : enabled === 'no' ? false : undefined,
      field: field,
      direction: direction
    }
  })

  const { data: partsData } = useQuery(GetSbomParts, {
    skip: selectedProd && selectedVersion ? false : true,
    variables: { projectId: selectedProd, sbomId: selectedVersion }
  })

  // GET SBOM PARTS
  const { data: deep } = useQuery(CheckDeepParts, {
    skip: selectedProd && selectedVersion ? false : true,
    variables: { projectId: selectedProd, sbomId: selectedVersion },
    onCompleted: (data) => console.log('Deep parts', data)
  })

  const isExists = partsData?.sbom?.sbomParts?.some(
    (item) => item?.part?.project?.id === prodId && item?.part?.id === sbomId
  )

  const existingNodes = deep?.sbom?.deepParts?.some(
    (item) => item?.id === sbomId
  )

  const [createSbomPart, { loading }] = useMutation(SbomPartCreate)
  const [deleteSbomPart, { loading: dlLoading }] = useMutation(SbomPartDelete)

  const handleCreatePart = async () => {
    await createSbomPart({
      variables: { parentSbomId: sbomId, partSbomId: selectedVersion }
    })
      .then((res) => {
        if (res.data) {
          prodVulnDispatch({ type: 'FILTER_SOURCE', payload: true })
          prodVulnDispatch({ type: 'FILTER_INCLUDE', payload: ['parts'] })
        }
      })
      .finally(() => {
        setSelectedGroup('')
        setSelectedProd('')
        setSelectedVersion('')
        onClose()
      })
  }

  const handleRemove = async () => {
    await deleteSbomPart({
      variables: { id: activeRow.id }
    }).then((res) => res?.data && onDeleteClose())
  }

  const [getProduct] = useLazyQuery(GetProject, {
    skip: signedUrlParams ? true : false
  })

  const handleSelectGroup = (e) => {
    const { value } = e.target
    if (value !== '') {
      setSelectedGroup(value)
      setSelectedProd('')
      setSelectedVersion('')
      const activeGroup =
        allProjects &&
        allProjects?.organization?.projectGroups?.nodes.find(
          (item) => item.id === value
        )
      const productList =
        activeGroup &&
        activeGroup.projects
          .filter((item) => item.enabled === true)
          .map((option) => ({
            value: option.id,
            label: option.name
          }))
      setEnvList(productList)
    } else {
      setSelectedGroup('')
      setSelectedProd('')
      setSelectedVersion('')
      setEnvList('')
    }
  }

  const handleSelectProduct = (e) => {
    const { value } = e.target
    setSelectedProd(value)
    if (value === '') {
      setSelectedVersion('')
    } else {
      getProduct({
        variables: { id: value }
      })
    }
  }

  const getSbomVersions = () => {
    if (!selectedGroup) {
      return []
    }

    if (!selectedProd) {
      return []
    }

    const activeGroup = allProjects?.organization?.projectGroups?.nodes.find(
      (item) => item.id === selectedGroup
    )

    const activeEnv = activeGroup?.projects?.find(
      (item) => item.id === selectedProd
    )

    const allSboms = activeEnv.sboms

    const allowedSboms = allSboms.filter((item) => {
      const previousUrls = partsContext.parts.map((i) => i.url)
      const allUrl = [...previousUrls, location.pathname]
      const urlHasId = allUrl.find((url) => url.includes(item.id))
      return !urlHasId
    })

    return allowedSboms.map((sbom) => ({
      label: sbom?.projectVersion,
      value: sbom?.id,
      creationAt: sbom?.createdAt
    }))
  }

  const sbomVersions = getSbomVersions()

  const onSelectPart = () => partsContext.push()

  const onFilterSev = (part, value) => {
    prodVulnDispatch({ type: 'CLEAR_PROD_VULN' })
    prodVulnDispatch({ type: 'FILTER_SEVERITY', payload: value })
    prodVulnDispatch({ type: 'FILTER_INCLUDE', payload: ['parts'] })
    onSelectPart(part)
  }

  const shouldPoll = sbomParts?.some(
    (item) => item?.part?.vulnRunStatus !== 'FINISHED'
  )

  useGradualPolling({ shouldPoll, startPolling, stopPolling })

  // COLUMNS
  const columns = [
    {
      id: 'NAME',
      name: 'NAME',
      selector: (row) => {
        const { part } = row
        const { primaryComponent, projectVersion, suppliers } = part || ''
        const { purl } = primaryComponent || ''
        const validPurl = isValidPurl(purl)

        const link = generateProductVersionDetailPageUrlFromCurrentUrl({
          productgroupid: part.project.projectGroup.id,
          productid: part.project.id,
          sbomid: part.id,
          paramsObj: {
            parts: true
          }
        })

        const icon = validPurl ? (
          GetIcon(purl?.split('/')[0], colorMode)
        ) : (
          <BsFillPatchQuestionFill
            fontSize={24}
            color={inverseSecondaryBgColor}
          />
        )

        return (
          <Grid
            templateColumns='repeat(7, 1fr)'
            sx={{ my: 3, gap: 2, alignItems: 'center' }}
          >
            <GridItem colSpan={1} width={'50px'}>
              <IconButton
                isRound={true}
                variant='solid'
                colorScheme='gray'
                icon={icon}
              />
            </GridItem>
            <GridItem colSpan={6}>
              <Stack spacing={1} direction='column'>
                <Link to={link} replace>
                  <Text
                    sx={{ fontSize: 14, color: primaryBlueText }}
                    onClick={() => onSelectPart(part)}
                  >
                    {part?.project?.projectGroup?.name}
                  </Text>
                </Link>
                <Text color={primaryTextColor}>{projectVersion}</Text>
                {suppliers?.map((item, index) => (
                  <Text key={index} color={primaryTextColor}>
                    {item?.name}
                  </Text>
                ))}
              </Stack>
            </GridItem>
          </Grid>
        )
      },
      width: '20%',
      wrap: true
    },
    {
      id: 'COMPONENTS',
      name: 'COMPONENTS',
      selector: (row) => {
        const { part } = row
        const link = generateProductVersionDetailPageUrlFromCurrentUrl({
          productid: part?.project?.id,
          sbomid: part?.id,
          paramsObj: {
            tab: 'components',
            parts: true
          }
        })
        return (
          <Link to={link} onClick={() => onSelectPart(part)}>
            <Tag
              size='md'
              variant='subtle'
              colorScheme={'blue'}
              sx={{ w: 16, cursor: 'pointer' }}
            >
              <TagLabel mx={'auto'}>{part.stats.compCount}</TagLabel>
            </Tag>
          </Link>
        )
      },
      width: '11%'
    },
    {
      id: 'LICENSES',
      name: 'LICENSES',
      selector: (row) => {
        const { part } = row
        const link = generateProductVersionDetailPageUrlFromCurrentUrl({
          productid: part?.project?.id,
          sbomid: part?.id,
          paramsObj: {
            tab: 'licenses',
            parts: true
          }
        })
        return (
          <Link to={link} onClick={() => onSelectPart(part)}>
            <Tag size='md' variant='subtle' width={16} colorScheme={'blue'}>
              <TagLabel mx={'auto'}>{part.stats.compLicenseCount}</TagLabel>
            </Tag>
          </Link>
        )
      },
      width: '8%'
    },
    {
      id: 'VULNERABILITIES',
      name: 'VULNERABILITIES',
      selector: (row) => {
        const { part, vulnRunStatus } = row
        const link = generateProductVersionDetailPageUrlFromCurrentUrl({
          productgroupid: part?.project?.projectGroup?.id,
          productid: part?.project?.id,
          sbomid: part?.id,
          paramsObj: {
            tab: 'vulnerabilities',
            parts: true
          }
        })
        return (
          <SimpleGrid gap={1} width={'100%'} columns={5}>
            <Link to={link} onClick={() => onFilterSev(part, ['critical'])}>
              <VulnBadge color='red' label='Critical' status={vulnRunStatus}>
                {part?.stats?.vulnStats?.critical || 0}
              </VulnBadge>
            </Link>
            <Link to={link} onClick={() => onFilterSev(part, ['high'])}>
              <VulnBadge color='orange' label='High' status={vulnRunStatus}>
                {part?.stats?.vulnStats?.high || 0}
              </VulnBadge>
            </Link>
            <Link to={link} onClick={() => onFilterSev(part, ['medium'])}>
              <VulnBadge color='yellow' label='Medium' status={vulnRunStatus}>
                {part?.stats?.vulnStats?.medium || 0}
              </VulnBadge>
            </Link>
            <Link to={link} onClick={() => onFilterSev(part, ['low'])}>
              <VulnBadge color='green' label='Low' status={vulnRunStatus}>
                {part?.stats?.vulnStats?.low || 0}
              </VulnBadge>
            </Link>
            <Link to={link} onClick={() => onFilterSev(part, ['unknown'])}>
              <VulnBadge color='gray' label='Unknown' status={vulnRunStatus}>
                {part?.stats?.vulnStats?.unknown || 0}
              </VulnBadge>
            </Link>
          </SimpleGrid>
        )
      },
      width: '26.8%'
    },
    {
      id: 'STATUS',
      name: 'STATUS',
      selector: (row) => {
        const { part } = row
        return (
          <Tag width={24} colorScheme='cyan' textTransform={'capitalize'}>
            <TagLabel mx={'auto'}>{part.lifecycle}</TagLabel>
          </Tag>
        )
      }
    },
    {
      id: 'ACTION',
      name: 'ACTION',
      selector: (row) => {
        return (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaEllipsisV />}
              variant='none'
              color={secondaryTextColor}
            />
            <Portal>
              <MenuList size='sm'>
                <MenuItem
                  isDisabled={!updateSboms || signedUrlParams}
                  onClick={() => {
                    setActiveRow(row)
                    onDeleteOpen()
                  }}
                >
                  Remove
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        )
      },
      right: 'true',
      omit: isArchived
    }
  ]

  // SUB HEADER
  const subHeaderComponent = useMemo(() => {
    return (
      <Flex
        sx={{ w: '100%', gap: 2, alignItems: 'center' }}
        justifyContent={'flex-end'}
      >
        <Tooltip label='Add Part' placement='top'>
          <IconButton
            ref={addBtn}
            variant='solid'
            onClick={onOpen}
            colorScheme='blue'
            icon={<AddIcon />}
            hidden={isArchived}
            sx={{ fontSize: 'sm', fontWeight: 'normal' }}
            isDisabled={!updateSboms || signedUrlParams}
          />
        </Tooltip>
        <RefreshBtn />
      </Flex>
    )
  }, [isArchived, onOpen, signedUrlParams, updateSboms])

  if (error) {
    return (
      <Card>
        <Text>Something went wrong</Text>
      </Card>
    )
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          subHeader
          data={sbomParts}
          persistTableHead
          columns={columns}
          responsive={true}
          progressComponent={<CustomLoader />}
          customStyles={customStyles(headingTextColor)}
          subHeaderComponent={subHeaderComponent}
          progressPending={sbomParts ? false : true}
        />
      </Flex>

      {isOpen && (
        <LynkModal
          isOpen={isOpen}
          buttonText='Add'
          onClose={onClose}
          Icon={BiLayerPlus}
          title={'Add Parts'}
          isLoading={loading}
          onSubmit={handleCreatePart}
          disabled={isExists === true || existingNodes === true}
        >
          <Stack spacing={4} direction={'column'} gap={2}>
            {/* PROJECTS */}
            <FormControl fontSize={'sm'} isRequired>
              <FormLabel htmlFor='product' fontSize={12}>
                Product
              </FormLabel>
              <LynkSelect
                name='groups'
                value={selectedGroup}
                onChange={handleSelectGroup}
              >
                {allProjects?.organization?.projectGroups?.nodes.map(
                  (item, index) => (
                    <option key={index} value={item.id}>
                      {truncatedValue(item.name, 30)}
                    </option>
                  )
                )}
              </LynkSelect>
            </FormControl>
            {/* ENVIRONMENTS */}
            <FormControl fontSize={'sm'} isRequired>
              <FormLabel htmlFor='product' fontSize={12}>
                Environment
              </FormLabel>
              <LynkSelect
                name='product'
                value={selectedProd}
                onChange={handleSelectProduct}
              >
                {envList?.length > 0 &&
                  envOrderList(envList).map((item, index) => (
                    <option
                      key={index}
                      value={item.value}
                      label={
                        isDefaultEnv(item.label)
                          ? capitalizeFirstLetter(item.label)
                          : item.label
                      }
                    >
                      {item.label}
                    </option>
                  ))}
              </LynkSelect>
            </FormControl>
            {/* Version */}
            <FormControl fontSize={'sm'} isRequired>
              <FormLabel htmlFor='versions' fontSize={12}>
                Version
              </FormLabel>
              {sbomVersions?.length === 0 ? (
                <LynkAlert status='info' msg='No version available' />
              ) : (
                <LynkSelect
                  name='versions'
                  value={selectedVersion}
                  onChange={(e) => setSelectedVersion(e.target.value)}
                >
                  {sbomVersions.map((item, index) => (
                    <option key={index} value={item.value}>
                      {truncatedValue(item?.label, 30)}
                    </option>
                  ))}
                </LynkSelect>
              )}
            </FormControl>
            {(isExists === true || existingNodes) && (
              <LynkAlert msg='Same version already exists inside selected SBOM' />
            )}
          </Stack>
        </LynkModal>
      )}

      {/* DISABLED */}
      {isDeleteOpen && (
        <ConfirmationModal
          title='Delete Part'
          isLoading={dlLoading}
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
          onConfirm={handleRemove}
          description='Deleting this version will:'
          name={`${activeRow?.part?.project?.projectGroup?.name} - ${activeRow?.part?.projectVersion}`}
          items={[
            'Remove this versions and its SBOM',
            'Remove access to this version for all users'
          ]}
        />
      )}
    </>
  )
}

export default Parts
