import { useState } from 'react'
import DataTable from 'react-data-table-component'
import { useParams } from 'react-router-dom'
import { customStyles } from 'utils'

import { Flex, useDisclosure } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import CpeCard from 'components/Misc/CpeCard'
import PurlCard from 'components/Misc/PurlCard'
import Pagination from 'components/Pagination'

import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetSbomSupportTab } from 'graphQL/Queries'

import SupportColumns from './Components/tableColumns/SupportColumns'
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
    GetSbomSupportTab,
    {
      skip: activeTab === 'support' ? false : true,
      selector: 'sbom.supports',
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
          columns={columns}
          data={nodes || []}
          customStyles={customStyles(headingTextColor)}
          defaultSortAsc={false}
          progressPending={loading}
          persistTableHead
          subHeader
          subHeaderComponent={subHeader}
          progressComponent={<CustomLoader />}
          responsive={true}
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
