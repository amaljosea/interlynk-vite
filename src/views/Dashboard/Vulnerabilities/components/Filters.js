import GlobalVulnFilters from './GlobalVulnFilters'
import GlobalVulnSearch from './GlobalVulnSearch'

const Filters = ({ setFilters }) => {
  return (
    <>
      <GlobalVulnSearch setFilters={setFilters} />
      <GlobalVulnFilters setFilters={setFilters} />
    </>
  )
}

export default Filters
