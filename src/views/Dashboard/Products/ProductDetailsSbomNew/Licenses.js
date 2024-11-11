import DataTable from 'react-data-table-component'
import { useParams } from 'react-router-dom'
import { customStyles } from 'utils'

import { Flex } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import Pagination from 'components/Pagination'

import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetSbomLicensesTable } from 'graphQL/Queries'

import LicenseColumns from './Components/tableColumns/LicenseColumns'
import ExpandedRow from './Components/tableExpanded/LicensesExpanded'
import LicensesSubHeader from './Components/tableSubHeaders/LicensesSubHeader'

const Licenses = () => {
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid
  const activeTab = useQueryParam('tab')

  const { headingTextColor } = useThemeColor(['headingTextColor'])

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
        <DataTable
          columns={columns}
          data={nodes}
          customStyles={customStyles(headingTextColor)}
          defaultSortAsc={false}
          defaultSortFieldId={'UPDATED_AT'}
          progressPending={loading}
          progressComponent={<CustomLoader />}
          subHeader
          subHeaderComponent={subHeader}
          responsive
          persistTableHead
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
