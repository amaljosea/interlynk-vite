import CustomLoader from 'components/CustomLoader'
import DataTable from 'react-data-table-component'
import { Button, Flex, Text } from '@chakra-ui/react'
import React, { useMemo, useState } from 'react'
import { customStyles } from 'utils'
import SearchFilter from 'views/Sbom/components/SearchFilter'
import SagFilters from 'views/Dashboard/SAG/Filters'
import Card from 'components/Card/Card'

const SagTable = ({ data }) => {
  const [searchInput, setSearchInput] = useState('')
  const [filterText, setFilterText] = useState(searchInput)
  const [category, setCategory] = useState('')
  const [label, setLabel] = useState('')

  const filteredData = data?.filter((item) => item?.productName?.toLowerCase().includes(searchInput.toLowerCase()) && item?.category?.toLowerCase().includes(category.toLowerCase()) && item?.label?.toLowerCase().includes(label.toLowerCase()))

  // CLEAR SERACH
  const handleClear = () => {
    setFilterText('')
    setSearchInput('')
  }

  // ON SEARCH INPUT CHANGE
  const onSearchInputChange = (e) => {
    const { value } = e.target
    if (value === '') {
      handleClear()
    } else {
      setFilterText(value)
    }
  }

  // SEARCH COMPONENT
  const handleSearch = (event) => {
    const { value } = event.target
    if (event.key === 'Enter' && filterText !== '') {
      setSearchInput(value)
    }
  }

  // COLUMNS
  const columns = [
    {
      id: 'PRODUCT_NAME',
      name: 'PRODUCT NAME',
      selector: (row) => <Text>{row?.productName}</Text>,
      wrap: true,
      width: '300px'
    },
    {
      id: 'PRODUCT_VERSION',
      name: 'PRODUCT VERSION',
      selector: (row) => <Text>{row?.productVersion}</Text>,
      width: '250px',
      wrap: true
    },
    {
      id: 'SAG_SCORE',
      name: 'SAG SCORE',
      selector: (row) => <Button pointerEvents={'none'} size='xs' variant='outline' colorScheme='blue' width={'60px'}>{row?.sagScore}</Button>,
      width: '200px',
      wrap: true
    },
    {
      id: 'CATEGORY',
      name: 'CATEGORY',
      selector: (row) => <Text>{row?.category}</Text>,
      width: '250px',
      wrap: true
    },
    {
      id: 'LABEL',
      name: 'LABEL',
      selector: (row) => <Text>{row?.label}</Text>,
      width: '360px',
      wrap: true
    },
    {
      id: 'UPDATED_AT',
      name: 'UPDATED',
      selector: (row) => <Text>{row.currentDate}</Text>,
      right: 'true',
      wrap: true
    }
  ]

  // SUB HEADER
  const subHeader = useMemo(() => {
    return (
      <>
        <Flex width={'100%'} alignItems={'center'} justifyContent={'flex-start'} mb={4} px={4} gap={4}>
          <SearchFilter id='sagData' filterText={filterText} onChange={onSearchInputChange} onClear={handleClear} onFilter={handleSearch} />
          <SagFilters category={category} setCategory={setCategory} label={label} setLabel={setLabel} />
        </Flex>
      </>
    )
  }, [filterText, category, label, setCategory, setLabel, handleClear, handleSearch, onSearchInputChange])

  return (
    <Card>
      <DataTable
        columns={columns}
        data={filteredData || []}
        customStyles={customStyles}
        subHeader
        subHeaderComponent={subHeader}
        progressComponent={<CustomLoader />}
        persistTableHead
        responsive={true}
      />
    </Card>
  )
}

export default SagTable
