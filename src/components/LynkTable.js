import DataTable from 'react-data-table-component'

import useQueryParam from 'hooks/useQueryParam'
import { useDataTableStyles } from 'hooks/useTableStyles'

import CustomLoader from './CustomLoader'

const LynkTable = (props) => {
  const tab = useQueryParam('tab')
  const customStyles = useDataTableStyles()

  const isSupportTab = tab === 'support'

  return (
    <DataTable
      {...props}
      responsive
      persistTableHead
      customStyles={customStyles}
      progressComponent={<CustomLoader />}
      defaultSortAsc={isSupportTab ? true : false}
    />
  )
}

export default LynkTable
