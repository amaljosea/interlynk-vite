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
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import ConnectedSbomDrawer from 'components/Drawer/ConnectedSbomDrawer'
import ComponentCard from 'components/Misc/ComponentCard'
import VersionCard from 'components/Misc/VersionCard'
import Pagination from 'components/Pagination'

import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { usePaginatatedQuery } from 'hooks/usePaginatatedQuery'

import { GetCompVulnData, GetConnectedSbom } from 'graphQL/Queries'

import { FaFolderTree } from 'react-icons/fa6'

import VexModal from './VexModal'
import VulnFilters from './VulnsFilter'

const VulnProdTable = ({ vulnId, sbomVersions }) => {
  const params = useParams()
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')
  const headColor = useColorModeValue('#4A5568', '#CBD5E0')
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')

  const { userPermissions } = useGlobalState()

  const manageFeeds = useHasPermission({
    parentKey: 'view_feeds',
    childKey: 'manage_feeds'
  })

  const [vulnState, setVulnState] = useState({
    vexComplete: false
  })

  const { nodes, paginationProps, refetch, loading, reset } =
    usePaginatatedQuery(GetCompVulnData, {
      skip: vulnId ? false : true,
      selector: 'componentVulns',
      variables: {
        ...vulnState,
        id: vulnId
      }
    })

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
              color={textColor}
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
          <Text color={textColor} my={2} textAlign={'right'}>
            {row?.component?.sbom?.projectVersion}
          </Text>
        </Tooltip>
      ),
      wrap: true,
      right: 'true',
      width: '10%'
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
            <Text color={textColor}>{component?.name || ''}</Text>
            <Text color={textColor}>{component?.version || ''}</Text>
          </Stack>
        )
      },
      wrap: true,
      width: '15%'
    },
    // ENV
    {
      id: 'ENVIRONMENT',
      name: 'ENVIRONMENT',
      selector: (row) => {
        const { component } = row
        return (
          <Text color={textColor} textTransform={'capitalize'}>
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
        const { vexStatus } = row
        return (
          <Tag
            size='md'
            variant='solid'
            width={'130px'}
            colorScheme={statusColor(vexStatus?.name || 'Unspecified')}
          >
            <TagLabel style={{ textTransform: 'capitalize' }} mx={'auto'}>
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
          <Text color={textColor}>{timeSince(row?.updatedAt)}</Text>
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
          customStyles={customStyles(headColor)}
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
          refetch={refetch}
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
