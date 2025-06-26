import { useLazyQuery } from '@apollo/client'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { areArraysEqual } from 'utils'

import { Flex, useDisclosure } from '@chakra-ui/react'

import ConnectedSbomDrawer from 'components/Drawer/ConnectedSbomDrawer'
import LynkTable from 'components/LynkTable'
import Pagination from 'components/Pagination'
import ComponentVulnsColumns from 'components/columns/ComponentVulnsColumns'
import ComponentVulnsHeader from 'components/headers/ComponentVulnsHeader'

import { usePaginatedQuery } from 'hooks/usePaginatedQuery'

import { GetCompVulnData, GetConnectedSbom } from 'graphQL/Queries'

import VexModal from './VexModal'

const VulnProdTable = ({ vuln, sbomVersions, prodGroups }) => {
  const params = useParams()
  const productGroupId = params?.productgroupid

  const { id, vulnId } = vuln || ''

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

  const onFilter = (newFilters) => {
    setVulnState(newFilters)
    reset()
  }

  const columns = ComponentVulnsColumns({ handlePreview })

  const subHeaderComponent = ComponentVulnsHeader({
    STATUS,
    filterInput,
    handleClear,
    handleSearch,
    onSearchInputChange,
    selectedVulns,
    onFilter,
    prodGroups,
    sbomVersions
  })

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
