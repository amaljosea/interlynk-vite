import { useLazyQuery } from '@apollo/client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useParams } from 'react-router-dom'
import {
  areArraysEqual,
  customStyles,
  getFullDateAndTime,
  statusColor,
  timeSince
} from 'utils'
import { getSignedUrlParams } from 'utils'
import ExportCsv from 'views/Dashboard/Products/components/ExportCsv'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import {
  Button,
  Flex,
  IconButton,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import ConnectedSbomDrawer from 'components/Drawer/ConnectedSbomDrawer'
import ComponentCard from 'components/Misc/ComponentCard'
import VersionCard from 'components/Misc/VersionCard'
import Pagination from 'components/Pagination'

import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetCompVulnData, GetConnectedSbom } from 'graphQL/Queries'

import { BsCircleHalf } from 'react-icons/bs'
import { FaFolderTree } from 'react-icons/fa6'

import VexModal from './VexModal'
import VulnFilters from './VulnsFilter'

const VulnProdTable = ({ vulnId, sbomVersions }) => {
  const params = useParams()
  const signedUrlParams = getSignedUrlParams()
  const { headingTextColor, primaryTextColor } = useThemeColor([
    'headingTextColor',
    'primaryTextColor'
  ])

  const manageFeeds = useHasPermission({
    parentKey: 'view_feeds',
    childKey: 'manage_feeds'
  })

  const [vulnState, setVulnState] = useState({
    vexComplete: false
  })

  const { nodes, paginationProps, loading, reset } = usePaginatedQuery(
    GetCompVulnData,
    {
      skip: vulnId ? false : true,
      selector: 'componentVulns',
      variables: {
        ...vulnState,
        id: vulnId
      }
    }
  )

  const [getSboms, { data: connectedSboms }] = useLazyQuery(GetConnectedSbom)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isSbomOpen,
    onOpen: onSbomOpen,
    onClose: onSbomClose
  } = useDisclosure()

  const {
    isOpen: isCardOpen,
    onOpen: onCardOpen,
    onClose: onCardClose
  } = useDisclosure()

  const {
    isOpen: isVCardOpen,
    onOpen: onVCardOpen,
    onClose: onVCardClose
  } = useDisclosure()

  const [statusResults, setStatusResults] = useState([])
  const [selectedVulns, setSelectedVulns] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [filterInput, setFilterInput] = useState('')
  const [checkEquals, setCheckEquals] = useState(false)
  const [toggleClear, setToggleClear] = useState(false)
  const [activeRow, setActiveRow] = useState(null)

  const handlePreview = async (row) => {
    const { id, component } = row
    await getSboms({
      fetchPolicy: 'network-only',
      variables: {
        projectId: component?.sbom?.project?.id,
        sbomId: component?.sbom?.id,
        componentVulnId: id
      }
    }).then((res) => {
      console.log(res?.data)
      onSbomOpen()
    })
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
                icon={<FaFolderTree />}
                onClick={() => handlePreview(row)}
                isDisabled={!component?.sbom?.hasConnectedSboms}
              />
            </Tooltip>
            <Text
              color={primaryTextColor}
              cursor={'pointer'}
              onClick={() => {
                setActiveRow(component)
                onVCardOpen()
              }}
            >
              {component?.sbom?.project?.projectGroup?.name || ''}
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
          <Text color={primaryTextColor} my={2} textAlign={'right'}>
            {row?.component?.sbom?.projectVersion}
          </Text>
        </Tooltip>
      ),
      wrap: true,
      right: 'true',
      width: '12%'
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
            cursor={'pointer'}
            alignItems={'flex-start'}
            onClick={() => {
              setActiveRow(component)
              onCardOpen()
            }}
          >
            <Text color={primaryTextColor}>{component?.name || ''}</Text>
            <Text color={primaryTextColor}>{component?.version || ''}</Text>
          </Stack>
        )
      },
      wrap: true,
      width: '24%'
    },
    // ENV
    {
      id: 'ENVIRONMENT',
      name: 'ENVIRONMENT',
      selector: (row) => {
        const { component } = row
        return (
          <Text color={primaryTextColor} textTransform={'capitalize'}>
            {component?.sbom?.project?.name || ''}
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
            size='md'
            variant='solid'
            width={'150px'}
            colorScheme={statusColor(vexStatus?.name || 'Unspecified')}
          >
            <TagLabel mx={'auto'} as={Flex} gap={2} alignItems='center'>
              {isComplete === false && <BsCircleHalf />}{' '}
              {vexStatus?.name || 'Unspecified'}
            </TagLabel>
          </Tag>
        )
      },
      wrap: true,
      right: 'true'
    },
    // UPDATED AT
    {
      id: 'VEX_UPDATED_AT',
      name: 'UPDATED',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row?.updatedAt)} placement={'top'}>
          <Text color={primaryTextColor}>{timeSince(row?.updatedAt)}</Text>
        </Tooltip>
      ),
      width: '12%',
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
        <Stack spacing={4} alignItems={'center'} direction={'row'}>
          <SearchFilter
            id='globalVulns'
            filterText={filterInput}
            onFilter={handleSearch}
            onClear={handleClear}
            onChange={onSearchInputChange}
          />
          <VulnFilters
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
            tableData={nodes}
            tableType={'Global Vulnerability Detail View'}
          />

          {/* UPDATE STATUES */}
          {selectedVulns.length > 0 && (
            <Button
              variant='solid'
              colorScheme='blue'
              fontWeight='normal'
              fontSize={'sm'}
              onClick={onOpen}
              isDisabled={signedUrlParams || !manageFeeds}
            >
              Set Status
            </Button>
          )}
        </Stack>
      </Flex>
    )
  }, [
    manageFeeds,
    filterInput,
    handleSearch,
    handleClear,
    onSearchInputChange,
    sbomVersions,
    selectedVulns.length,
    onOpen,
    signedUrlParams,
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
        <DataTable
          subHeader
          responsive
          selectableRows
          persistTableHead
          columns={columns}
          progressPending={loading}
          data={statusResults || []}
          clearSelectedRows={toggleClear}
          onSelectedRowsChange={handleChange}
          progressComponent={<CustomLoader />}
          customStyles={customStyles(headingTextColor)}
          subHeaderComponent={subHeaderComponent}
        />
        <Pagination {...paginationProps} />
      </Flex>

      {isSbomOpen && connectedSboms && (
        <ConnectedSbomDrawer
          data={connectedSboms?.sbom}
          isOpen={isSbomOpen}
          onClose={onSbomClose}
        />
      )}

      {isOpen && selectedVulns.length > 0 && (
        <VexModal
          isOpen={isOpen}
          onClose={onClose}
          checkEquals={checkEquals}
          selectedGroup={selectedGroup}
          selectedVulns={selectedVulns}
          setSelectedVulns={setSelectedVulns}
          setToggleClear={setToggleClear}
        />
      )}

      {isCardOpen && (
        <ComponentCard
          isOpen={isCardOpen}
          onClose={onCardClose}
          data={activeRow}
        />
      )}

      {isVCardOpen && (
        <VersionCard
          isOpen={isVCardOpen}
          onClose={onVCardClose}
          data={activeRow}
        />
      )}
    </>
  )
}

export default VulnProdTable
