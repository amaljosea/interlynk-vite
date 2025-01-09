import GlobalVulnFilters from './GlobalVulnFilters'
import GlobalVulnSearch from './GlobalVulnSearch'

const Filters = ({ reset }) => {
  return (
    <>
      <GlobalVulnSearch />
      <GlobalVulnFilters reset={reset} />
    </>
  )
}

export default Filters
