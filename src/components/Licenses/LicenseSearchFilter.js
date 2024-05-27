import { useCallback, useState } from 'react'
import SearchFilter from 'views/Sbom/components/SearchFilter'

export const LicenseSearchFilter = ({ setFilters }) => {
  const [searchInput, setSearchInput] = useState('')

  const setSearchFilter = (value) => {
    setFilters((oldFilter) => ({
      ...oldFilter,
      search: value
    }))
  }

  // CLEAR SERACH
  const handleClear = useCallback(() => {
    setSearchInput('')
    setFilters((oldFilter) => ({
      ...oldFilter,
      search: undefined
    }))
  }, [setFilters])

  const handleSearch = (event) => {
    const {
      key,
      target: { value }
    } = event
    if (key === 'Enter' && value !== '') {
      setSearchFilter(value)
    }
  }

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = useCallback(
    (e) => {
      const { value } = e.target
      if (value === '') {
        handleClear()
      } else {
        setSearchInput(value)
      }
    },
    [handleClear]
  )

  return (
    <SearchFilter
      id='license'
      filterText={searchInput}
      onFilter={handleSearch}
      onClear={handleClear}
      onChange={onSearchInputChange}
    />
  )
}

export default SearchFilter
