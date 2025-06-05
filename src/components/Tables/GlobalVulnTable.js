import { useState } from 'react'

import { Flex } from '@chakra-ui/react'
import { useDisclosure } from '@chakra-ui/react'

import VulnProductsDrawer from 'components/Drawer/VulnProductsDrawer'
import LynkTable from 'components/LynkTable'
import GlobalVulnerabilityColumns from 'components/columns/GlobalVulnerabilityColumns'
import GlobalVulnerabilityHeader from 'components/headers/GlobalVulnerabilityHeader'

import { useGlobalState } from 'hooks/useGlobalState'

import Pagination from '../Pagination'

const GlobalVulnTable = (props) => {
  const { vulns, reset, filters, loading, paginationProps } = props
  const { isOpen, onClose, onOpen } = useDisclosure()

  const { globalVulnState, dispatch } = useGlobalState()
  const { globalVulnDispatch } = dispatch

  const [activeRow, setActiveRow] = useState({})

  const action = (type, data) => {
    setActiveRow(data)
    switch (type) {
      case 'view_affected_products':
        return onOpen()
    }
  }

  // COLUMNS
  const columns = GlobalVulnerabilityColumns({ action })

  // HEADER
  const subHeader = GlobalVulnerabilityHeader({ reset, filters })

  // SORTING
  const handleSort = (column, sortDirection) => {
    globalVulnDispatch({
      type: 'SET_SORT_ORDER',
      payload: {
        field: column?.id,
        direction: sortDirection === 'asc' ? 'ASC' : 'DESC'
      }
    })
  }

  const data = vulns?.map((row, index) => ({ ...row, key: index }))

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <LynkTable
          subHeader
          data={data}
          columns={columns}
          onSort={handleSort}
          progressPending={loading}
          subHeaderComponent={subHeader}
          defaultSortFieldId={globalVulnState?.field}
          defaultSortAsc={globalVulnState?.direction === 'ASC' ? true : false}
        />
        <Pagination {...paginationProps} />
      </Flex>

      {isOpen && (
        <VulnProductsDrawer
          isOpen={isOpen}
          onClose={onClose}
          data={activeRow}
        />
      )}
    </>
  )
}

export default GlobalVulnTable
