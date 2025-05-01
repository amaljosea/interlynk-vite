import { useLazyQuery } from '@apollo/client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { areArraysEqual, getFullDate, timeSince } from 'utils'
import { statusColor } from 'utils/styleUtils'
import ExportCsv from 'views/Dashboard/Products/components/ExportCsv'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import {
  Flex,
  IconButton,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'

import ConnectedSbomDrawer from 'components/Drawer/ConnectedSbomDrawer'
import LynkTable from 'components/LynkTable'
import Pagination from 'components/Pagination'

import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetCompVulnData, GetConnectedSbom } from 'graphQL/Queries'

import { BsCircleHalf } from 'react-icons/bs'
import { FaPen } from 'react-icons/fa'
import { LuFolderTree, LuSquarePen } from 'react-icons/lu'

import VexModal from './VexModal'
import VulnFilters from './VulnsFilter'

const VulnProdTable = ({ vuln, sbomVersions, prodGroups }) => {
  const params = useParams()
  const productGroupId = params?.productgroupid
  const { primaryTextColor, secondaryTextColor } = useThemeColor([
    'primaryTextColor',
    'secondaryTextColor'
  ])

  const { id, vulnId } = vuln || ''

  const editVulns = useHasPermission({
    parentKey: 'view_sbom',
    childKey: 'edit_vulnerabilities'
  })

  const [vulnState, setVulnState] = useState({
    vexComplete: undefined,
    projectGroupIds: productGroupId ? [productGroupId] : undefined
  })

  const { nodes, paginationProps, loading, reset } = usePaginatedQuery(
    GetCompVulnData,
    {
      skip: id ? false : true,
      selector: 'componentVulns',
      variables: { ...vulnState, id: id }
    }
  )

  const [getSboms, { data: connectedSboms }] = useLazyQuery(GetConnectedSbom)

  const STATUS = useDisclosure()
  const SBOM = useDisclosure()

  const [statusResults, setStatusResults] = useState([])
  const [selectedVulns, setSelectedVulns] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [filterInput, setFilterInput] = useState('')
  const [checkEquals, setCheckEquals] = useState(false)
  const [toggleClear, setToggleClear] = useState(false)

  const handlePreview = async (row) => {
    const { id, component } = row
    await getSboms({
      fetchPolicy: 'network-only',
      variables: {
        projectId: component?.sbom?.project?.id,
        sbomId: component?.sbom?.id,
        componentVulnId: id
      }
    }).then(() => SBOM.onOpen())
  }

  // COLUMNS
  const columns = [
    // PRODUCTS
    {
      id: 'PRODUCT_GROUP',
      name: 'PRODUCT',
      selector: (row) => {
        const { component } = row
        return (
          <Flex flexDir={'row'} my={3} gap={2} alignItems={'center'}>
            <Tooltip label='Also affected'>
              <IconButton
                size='xs'
                colorScheme='blue'
                icon={<LuFolderTree size={16} />}
                onClick={() => handlePreview(row)}
                isDisabled={!component?.sbom?.hasConnectedSboms}
              />
            </Tooltip>
            <Text fontSize={14} color={primaryTextColor}>
              {component?.sbom?.project?.projectGroup?.name || 'N/A'}
            </Text>
          </Flex>
        )
      },
      wrap: true,
      width: '15%',
      omit: params?.name ? true : false
    },
    // VERSION
    {
      id: 'PRODUCT_VERSIONN',
      name: 'VERSION',
      selector: (row) => (
        <Tooltip label={row?.component?.sbom?.projectVersion} placement='top'>
          <Text fontSize={14} color={primaryTextColor} my={2}>
            {row?.component?.sbom?.projectVersion}
          </Text>
        </Tooltip>
      ),
      wrap: true,
      width: '14%'
    },
    // VULN COMPONENT
    {
      id: 'COMPONENTS_NAME',
      name: 'COMPONENT',
      selector: (row) => {
        const { component } = row
        return (
          <Stack
            my={3}
            spacing={1}
            direction='column'
            alignItems={'flex-start'}
          >
            <Text fontSize={14} color={primaryTextColor}>
              {component?.name || 'N/A'}
            </Text>
            <Text fontSize={14} color={secondaryTextColor}>
              {component?.version || 'N/A'}
            </Text>
          </Stack>
        )
      },
      wrap: true,
      width: '26%'
    },
    // ENV
    {
      id: 'ENVIRONMENT',
      name: 'ENVIRONMENT',
      selector: (row) => {
        const { component } = row
        return (
          <Text
            fontSize={14}
            color={primaryTextColor}
            textTransform={'capitalize'}
          >
            {component?.sbom?.project?.name || 'N/A'}
          </Text>
        )
      },
      wrap: true,
      width: '12%'
    },
    // STATUS
    {
      id: 'VEX_STATUSES_NAME',
      name: 'STATUS',
      selector: (row) => {
        const { vexStatus, isComplete } = row
        return (
          <Tag
            variant='solid'
            colorScheme={statusColor(vexStatus?.name || 'Unspecified')}
          >
            <TagLabel
              gap={2}
              as={Flex}
              mx={'auto'}
              fontSize={14}
              alignItems='center'
            >
              {isComplete === false && <BsCircleHalf />}{' '}
              {vexStatus?.name || 'Unspecified'}
            </TagLabel>
          </Tag>
        )
      },
      wrap: true
    },
    // UPDATED AT
    {
      id: 'VEX_UPDATED_AT',
      name: 'UPDATED',
      selector: (row) => (
        <Tooltip label={getFullDate(row?.updatedAt)} placement={'top'}>
          <Text color={primaryTextColor}>{timeSince(row?.updatedAt)}</Text>
        </Tooltip>
      ),
      right: 'true',
      wrap: true
    }
  ]

  const setSearchFilter = useCallback(
    (value) => {
      setVulnState((oldFilter) => ({
        ...oldFilter,
        search: value
      }))
      reset()
    },
    [reset]
  )

  // SEARCH COMPONENT
  const handleSearch = useCallback(
    async (event) => {
      const {
        key,
        target: { value }
      } = event
      if (key === 'Enter' && value !== '') {
        setSearchFilter(value)
      }
    },
    [setSearchFilter]
  )

  // CLEAR SERACH
  const handleClear = useCallback(() => {
    setFilterInput('')
    setVulnState((oldFilter) => ({
      ...oldFilter,
      search: undefined
    }))
    reset()
  }, [reset])

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = useCallback(
    (e) => {
      const { value } = e.target
      if (value === '') {
        handleClear()
      } else {
        setFilterInput(value)
      }
    },
    [handleClear]
  )

  const subHeaderComponent = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        {/* FILTER */}
        <Stack spacing={2} alignItems={'center'} direction={'row'}>
          <SearchFilter
            id='globalVulns'
            filterText={filterInput}
            onFilter={handleSearch}
            onClear={handleClear}
            onChange={onSearchInputChange}
          />
          <VulnFilters
            prodGroups={prodGroups}
            sbomVersions={sbomVersions}
            setFilter={(newFilters) => {
              setVulnState(newFilters)
              reset()
            }}
          />
        </Stack>
        <Stack spacing={2} alignItems={'center'} direction={'row'}>
          {/* EXPORT CSV */}
          <ExportCsv
            tableType={'Vulnerability Detail View'}
            filters={{ ...vulnState }}
          />
          {/* UPDATE STATUES */}
          {selectedVulns.length > 0 && (
            <Tooltip label={'Set Status'}>
              <IconButton
                icon={<LuSquarePen size={18} />}
                variant='solid'
                colorScheme='blue'
                fontWeight='normal'
                title='Set vuln status'
                onClick={STATUS.onOpen}
                isDisabled={!editVulns}
              />
            </Tooltip>
          )}
        </Stack>
      </Flex>
    )
  }, [
    filterInput,
    handleSearch,
    handleClear,
    onSearchInputChange,
    prodGroups,
    sbomVersions,
    vulnState,
    selectedVulns.length,
    STATUS.onOpen,
    editVulns,
    reset
  ])

  const handleChange = (state) => {
    setSelectedVulns(state?.selectedRows)
    const version =
      state?.selectedRows[0]?.component?.sbom?.primaryComponent?.version
    const versionData = state.selectedRows.map(
      (item) => item?.component?.sbom?.primaryComponent?.version
    )
    const sameData = versionData.filter((item) => item === version)
    const checkEquality = areArraysEqual(versionData, sameData)
    setCheckEquals(checkEquality)
    if (checkEquality) {
      setSelectedGroup(
        state?.selectedRows[0]?.component?.sbom?.project?.projectGroup?.id
      )
    } else {
      setSelectedGroup('')
    }
  }

  useEffect(() => {
    if (nodes) {
      const sortedData =
        nodes &&
        [...nodes].sort((a, b) => {
          const dateA = new Date(a.updatedAt)
          const dateB = new Date(b.updatedAt)
          return dateB - dateA
        })
      setStatusResults(sortedData)
    }
  }, [nodes])

  return (
    <>
      {/* TABLE */}
      <Flex flexDir={'column'} width={'100%'}>
        <LynkTable
          subHeader
          selectableRows
          columns={columns}
          progressPending={loading}
          data={statusResults || []}
          clearSelectedRows={toggleClear}
          onSelectedRowsChange={handleChange}
          className='data-table-container'
          subHeaderComponent={subHeaderComponent}
        />
        <Pagination {...paginationProps} />
      </Flex>

      {SBOM.isOpen && connectedSboms && (
        <ConnectedSbomDrawer
          data={connectedSboms?.sbom}
          isOpen={SBOM.isOpen}
          onClose={SBOM.onClose}
        />
      )}

      {STATUS.isOpen && selectedVulns.length > 0 && (
        <VexModal
          vulnId={vulnId}
          isOpen={STATUS.isOpen}
          onClose={STATUS.onClose}
          checkEquals={checkEquals}
          selectedGroup={selectedGroup}
          selectedVulns={selectedVulns}
          setSelectedVulns={setSelectedVulns}
          setToggleClear={setToggleClear}
        />
      )}
    </>
  )
}

export default VulnProdTable
