import LicenseFilter from './LicenseFilter'
import { LicenseSearchFilter } from './LicenseSearchFilter'

const Filter = ({ setFilters }) => {
  const handleFilter = (key, value) => {
    setFilters((oldFilters) => ({
      ...oldFilters,
      [key]: value[0]
    }))
  }
  return (
    <>
      <LicenseSearchFilter setFilters={setFilters} />
      <LicenseFilter onFilter={handleFilter} />
    </>
  )
}

export default Filter
