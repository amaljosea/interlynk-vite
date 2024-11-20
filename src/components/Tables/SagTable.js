import React, { useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { Link } from 'react-router-dom'
import { customStyles } from 'utils'
import SagFilters from 'views/Dashboard/SAG/Filters'
import SearchFilter from 'views/Sbom/components/SearchFilter'

import { Badge, Button, Flex, IconButton, Stack, Text } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CustomLoader from 'components/CustomLoader'

import { FaEnvelope } from 'react-icons/fa6'

const SagTable = ({ data }) => {
  const [searchInput, setSearchInput] = useState('')
  const [filterText, setFilterText] = useState(searchInput)
  const [supplier, setSupplier] = useState('')
  const [category, setCategory] = useState('')
  const [label, setLabel] = useState('')

  const filteredData = data?.filter(
    (item) =>
      item?.productName?.toLowerCase().includes(searchInput.toLowerCase()) &&
      item?.supplierName?.toLowerCase().includes(supplier.toLowerCase()) &&
      item?.category?.toLowerCase().includes(category.toLowerCase()) &&
      item?.label?.toLowerCase().includes(label.toLowerCase())
  )

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
      selector: (row) => {
        const { supplierName, productName } = row
        return (
          <Stack my={4} alignItems={'flex-start'} spacing={2}>
            <Text>{productName}</Text>
            <Badge p={1}>{supplierName}</Badge>
          </Stack>
        )
      },
      wrap: true,
      width: '300px'
    },
    {
      id: 'PRODUCT_VERSION',
      name: 'PRODUCT VERSION',
      selector: (row) => <Text>{row?.productVersion}</Text>,
      width: '200px',
      wrap: true
    },
    {
      id: 'SAG_SCORE',
      name: 'SAG SCORE',
      selector: (row) => (
        <Button
          title={'SAG score'}
          pointerEvents={'none'}
          size='xs'
          variant='outline'
          colorScheme='blue'
          width={'60px'}
        >
          {row?.sagScore}
        </Button>
      ),
      width: '150px',
      wrap: true
    },
    {
      id: 'CATEGORY',
      name: 'PRODUCT CATEGORY',
      selector: (row) => <Text>{row?.category}</Text>,
      width: '220px',
      wrap: true
    },
    {
      id: 'LABEL',
      name: 'LABEL TYPE',
      selector: (row) => <Text>{row?.label}</Text>,
      width: '300px',
      size: 'lg',
      wrap: true
    },
    {
      id: 'OMB-M-22-18 CRITERIA',
      name: 'OMB-M-22-18 CRITERIA',
      selector: (row) => {
        if (row?.link) {
          return (
            <Link to={row.link} target='_blank'>
              <IconButton colorScheme='blue' size='sm' icon={<FaEnvelope />} />
            </Link>
          )
        } else {
          return null // Return nothing if link value is not present
        }
      },
      width: '210px',
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
        <Flex
          width={'100%'}
          alignItems={'center'}
          justifyContent={'flex-start'}
          mb={4}
          px={4}
          gap={4}
        >
          <SearchFilter
            id='sagData'
            filterText={filterText}
            onChange={onSearchInputChange}
            onClear={handleClear}
            onFilter={handleSearch}
          />
          <SagFilters
            category={category}
            setCategory={setCategory}
            label={label}
            setLabel={setLabel}
            supplier={supplier}
            setSupplier={setSupplier}
          />
        </Flex>
      </>
    )
  }, [
    filterText,
    category,
    label,
    setCategory,
    setLabel,
    supplier,
    setSupplier,
    handleClear,
    handleSearch,
    onSearchInputChange
  ])

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
