import { useState } from 'react'
import SearchFilter from 'views/Sbom/components/SearchFilter'

export const LicenseSearchFilter = ({ setFilters }) => {
  const [searchInput, setSearchInput] = useState('')

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

    if (key === 'Enter') {
      setSearchFilter(value)
    }
  }

  return (
    <SearchFilter
      id='license'
      filterText={searchInput}
      onFilter={handleSearch}
      onClear={() => {
        setSearchFilter('')
        setSearchInput('')
      }}
      onChange={(e) => setSearchInput(e.target.value)}
    />
  )
}

export default SearchFilter
