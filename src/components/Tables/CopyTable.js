import { Flex, Text } from '@chakra-ui/react'
import React from 'react'
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
      id: 'componentOne',
      name: 'COMPONENT ONE',
      selector: (row) => <Text>{row.componentOne}</Text>
    },
    // VERSION  ONW
    {
      id: 'versionOne',
      name: 'VERSION ONE',
      selector: (row) => <Text>{row.versionOne}</Text>
    },
    // COMPONENT TWO
    {
      id: 'componentTwo',
      name: 'COMPONENT TWO',
      selector: (row) => <Text>{row.componentTwo}</Text>
    },
    // VERSION TWO
    {
      id: 'versionTwo',
      name: 'VERSION TWO',
      selector: (row) => <Text>{row.versionTwo}</Text>
    }
  ]

  return (
    <>
      {data.length > 0 ? (
        <Flex flexDir={'column'} width={'100%'}>
          <DataTable
            columns={columns}
            data={data}
            customStyles={customStyles}
            progressPending={data.length === 0}
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
