import { useParams } from 'react-router-dom'

import { Flex } from '@chakra-ui/react'

import Pagination from 'components/Pagination'

import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'

import { GetSbomLicensesTable } from 'graphQL/Queries'

import LicenseColumns from './Components/tableColumns/LicenseColumns'
import ExpandedRow from './Components/tableExpanded/LicensesExpanded'
import LicensesSubHeader from './Components/tableSubHeaders/LicensesSubHeader'
import LynkTable from 'components/LynkTable'

const Licenses = () => {
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid
  const activeTab = useQueryParam('tab')

  const { nodes, paginationProps, loading } = usePaginatedQuery(
    GetSbomLicensesTable,
    {
      skip: activeTab === 'licenses' ? false : true,
      selector: 'sbom.componentLicenses',
      variables: {
        projectId: productId,
        sbomId: sbomId
      }
    }
  )

  // COLUMNS
  const columns = LicenseColumns()

  // HEADER SECTION
  const subHeader = LicensesSubHeader()

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <LynkTable
          columns={columns}
          data={nodes}
          defaultSortFieldId={'UPDATED_AT'}
          progressPending={loading}
          subHeader
          subHeaderComponent={subHeader}
          expandableRows
          expandOnRowClicked
          expandableRowsComponent={ExpandedRow}
        />
        {/* PAGINATION */}
        <Pagination {...paginationProps} />
      </Flex>
    </>
  )
}

export default Licenses
