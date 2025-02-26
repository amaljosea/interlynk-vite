import { useState } from 'react'
import DataTable from 'react-data-table-component'
import { useParams } from 'react-router-dom'
import { customStyles } from 'utils/styleUtils'

import { Flex, useDisclosure } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import CpeCard from 'components/Misc/CpeCard'
import PurlCard from 'components/Misc/PurlCard'
import Pagination from 'components/Pagination'

import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetCompSupportData } from 'graphQL/Queries'

import SupportColumns from './Components/tableColumns/SupportColumns'
import SupportExpand from './Components/tableExpanded/SupportExpanded'
import SupportSubHeader from './Components/tableSubHeaders/SupportSubHeader'

const Support = () => {
  const params = useParams()
  const projectId = params.productid
  const sbomId = params.sbomid
  const activeTab = useQueryParam('tab')

  const { headingTextColor } = useThemeColor(['headingTextColor'])

  const CARD = useDisclosure()

  const [activeRow, setActiveRow] = useState(null)

  const { nodes, paginationProps, loading, reset } = usePaginatedQuery(
    GetCompSupportData,
    {
      skip: activeTab === 'support' ? false : true,
      selector: 'sbom.components',
      variables: { sbomId, projectId: projectId }
    }
  )

  // SUB HEADER
  const subHeader = SupportSubHeader(reset)

  // COLUMNS
  const columns = SupportColumns(setActiveRow, CARD.onOpen)

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <DataTable
          subHeader
          expandableRows
          persistTableHead
          responsive={true}
          columns={columns}
          data={nodes || []}
          expandOnRowClicked
          defaultSortAsc={false}
          progressPending={loading}
          subHeaderComponent={subHeader}
          progressComponent={<CustomLoader />}
          expandableRowsComponent={SupportExpand}
          customStyles={customStyles(headingTextColor)}
        />

        {/* PAGINATION */}
        <Pagination {...paginationProps} />
      </Flex>

      {CARD.isOpen && activeRow?.idUri?.startsWith('pkg') && (
        <PurlCard
          value={activeRow?.idUri}
          isOpen={CARD.isOpen}
          onClose={CARD.onClose}
        />
      )}

      {CARD.isOpen && activeRow?.idUri?.startsWith('cpe') && (
        <CpeCard
          value={activeRow?.idUri}
          isOpen={CARD.isOpen}
          onClose={CARD.onClose}
        />
      )}
    </>
  )
}

export default Support
