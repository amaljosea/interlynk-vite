import {
  Flex,
  Text,
  Select,
  Switch,
  Tag,
  Input,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button
} from '@chakra-ui/react'
import React, { useMemo } from 'react'
import DataTable from 'react-data-table-component'

const customStyles = {
  headCells: {
    style: {
      fontWeight: 'bold',
      color: '#2D3748',
      fontSize: '12px',
      letterSpacing: '1px'
    }
  }
}

const CopyTable = ({ data }) => {
  // COLUMNS
  const columns = [
    // CVE
    {
      id: 'cve',
      name: 'CVE',
      selector: (row) => <Text>{row.cve}</Text>
    },
    // COMPONENT ONE
    {
      id: 'component',
      name: 'COMPONENT',
      selector: (row) => <Text>{row.component}</Text>
    },
    {
      id: 'version',
      name: 'VERSION',
      selector: (row) => <Text>{row.version}</Text>
    },
    {
      id: 'status',
      name: 'CURRENT STATUS',
      selector: (row) => <Tag colorScheme='gray'>{row.status}</Tag>
    },
    // VERSION TWO
    {
      id: 'newStatus',
      name: 'NEW STATUS',
      selector: (row) => <Tag colorScheme='green'>{row.newStatus}</Tag>
    },
    {
      id: 'history',
      name: 'KEEP HISTORY',
      selector: (row) => <Switch id='history' defaultChecked />
    },
    {
      id: 'resolution',
      name: 'RESOLUTION',
      selector: (row) => (
        <Select size='sm'>
          {' '}
          <option value='option1'>Accept</option>
          <option value='option2'>Keep Current</option>
        </Select>
      )
    }
  ]

  const subHeaderComponentMemo = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Input
          width={'400px'}
          id='search'
          type='text'
          placeholder='Search'
          aria-label='Search Input'
        />

        <Menu>
          <MenuButton
            as={Button}
            colorScheme='blue'
            fontWeight='normal'
            fontSize='sm'
          >
            Resolution
          </MenuButton>
          <MenuList>
            <MenuItem fontSize='sm'>Accept</MenuItem>
            <MenuItem fontSize='sm'>Keep Current</MenuItem>
          </MenuList>
        </Menu>

        {/* <Select width={'fit-content'}>
          <option value=''>-- Select --</option>
          <option value='Accept'>Accept</option>
          <option value='Keep Current'>Keep Current</option>
        </Select> */}
      </Flex>
    )
  }, [])

  return (
    <>
      {data.length > 0 ? (
        <Flex flexDir={'column'} width={'100%'} mt={2}>
          <DataTable
            columns={columns}
            data={data}
            customStyles={customStyles}
            progressPending={data.length === 0}
            subHeader
            subHeaderComponent={subHeaderComponentMemo}
            responsive={true}
            selectableRows={true}
          />
        </Flex>
      ) : (
        <Flex
          width={'100%'}
          mt={4}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <Text>No data found</Text>
        </Flex>
      )}
    </>
  )
}

export default CopyTable
