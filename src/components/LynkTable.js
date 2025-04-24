import DataTable from 'react-data-table-component'

import { useDataTableStyles } from 'hooks/useTableStyles'

import CustomLoader from './CustomLoader'

const LynkTable = (props) => {
  const customStyles = useDataTableStyles()

  return (
    <DataTable
      {...props}
      responsive
      persistTableHead
      defaultSortAsc={false}
      customStyles={customStyles}
      progressComponent={<CustomLoader />}
    />
  )
}

export default LynkTable
