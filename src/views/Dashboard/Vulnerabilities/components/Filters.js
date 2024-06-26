import GlobalVulnFilters from './GlobalVulnFilters'
import GlobalVulnSearch from './GlobalVulnSearch'

const Filters = ({ filters, setFilters }) => {
  return (
    <>
      <GlobalVulnSearch filters={filters} setFilters={setFilters} />
      <GlobalVulnFilters setFilters={setFilters} />
    </>
  )
}

export default Filters
