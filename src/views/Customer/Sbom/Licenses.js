import { useParams } from 'react-router-dom'
import LicenseColumns from 'views/Dashboard/Products/ProductDetailsSbomNew/Components/tableColumns/LicenseColumns'
import ExpandedRow from 'views/Dashboard/Products/ProductDetailsSbomNew/Components/tableExpanded/LicensesExpanded'
import LicensesSubHeader from 'views/Dashboard/Products/ProductDetailsSbomNew/Components/tableSubHeaders/LicensesSubHeader'

import { Flex, Text } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import Pagination from 'components/Pagination'

import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetShareLicensesTable } from 'graphQL/Queries'
import LynkTable from 'components/LynkTable'

const Licenses = () => {
  const params = useParams()
  const sbomId = params.sbomid
  const activeTab = useQueryParam('tab')

  const { primaryTextColor } = useThemeColor(['primaryTextColor'])

  const { nodes, loading, error, paginationProps } = usePaginatedQuery(
    GetShareLicensesTable,
    {
      skip: activeTab !== 'licenses',
      selector: 'shareLynkQuery.sbom.componentLicenses',
      variables: { sbomId }
    }
  )

  //Subheader
  const subHeader = LicensesSubHeader()

  //Columns
  const columns = LicenseColumns()

  if (error) {
    return (
      <Card>
        <Text color={primaryTextColor}>Something went wrong</Text>
      </Card>
    )
  }

  return (
    <>
      <Flex flexDir={'column'} width={'100%'}>
        <LynkTable
          columns={columns}
          data={nodes || []}
          defaultSortFieldId={'UPDATED_AT'}
          progressPending={loading}
          subHeader
          subHeaderComponent={subHeader}
          expandableRows
          expandOnRowClicked
          expandableRowsComponent={ExpandedRow}
        />
      </Flex>

      <Pagination {...paginationProps} />
    </>
  )
}

export default Licenses
