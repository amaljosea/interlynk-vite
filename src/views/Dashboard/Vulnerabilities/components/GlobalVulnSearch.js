import { useState } from 'react'
import SearchFilter from 'views/Sbom/components/SearchFilter'

const GlobalVulnSearch = ({ filters, setFilters }) => {
  const { search } = filters || ''
  const [searchInput, setSearchInput] = useState(search || '')

  const setSearchFilter = (value) => {
    setFilters((oldFilter) => ({
      ...oldFilter,
      search: value
    }))
  }

  const handleSearch = (event) => {
    const {
      key,
      target: { value }
    } = event
    if (key === 'Enter' && value !== '') {
      setSearchFilter(value)
    }
  }

  const onClear = () => {
    setSearchInput('')
    setFilters((oldFilter) => ({
      ...oldFilter,
      search: undefined
    }))
  }

  const onChangeSearchInput = (e) => {
    const { value } = e.target
    if (value === '') {
      onClear()
    } else {
      setSearchInput(value)
    }
  }

  return (
    <SearchFilter
      onClear={onClear}
      onFilter={handleSearch}
      filterText={searchInput}
      id='globalVulnerabilities'
      onChange={onChangeSearchInput}
    />
  )
}

export default GlobalVulnSearch
