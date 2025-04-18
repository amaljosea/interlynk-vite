import { useEffect, useState } from 'react'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { useGlobalState } from 'hooks/useGlobalState'

const GlobalVulnSearch = ({ reset }) => {
  const { globalVulnState, dispatch } = useGlobalState()
  const { globalVulnDispatch } = dispatch

  const [searchInput, setSearchInput] = useState('')

  const handleSearch = (event) => {
    if (event.key === 'Enter' && event.target.value !== '') {
      globalVulnDispatch({
        type: 'CHANGE_SEARCH_INPUT',
        payload: event.target.value
      })
      reset()
    }
  }

  const onClear = () => {
    setSearchInput('')
    globalVulnDispatch({ type: 'CLEAR_SEARCH_INPUT' })
  }

  const onChangeSearchInput = (e) => {
    if (e.target.value === '') {
      onClear()
    } else {
      setSearchInput(e.target.value)
    }
  }

  useEffect(() => {
    if (globalVulnState?.search !== '') {
      setSearchInput(globalVulnState?.search)
    } else {
      setSearchInput('')
    }
  }, [globalVulnState?.search])

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
