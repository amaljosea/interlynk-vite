// Chakra imports
import React from 'react'

import {
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
  useColorModeValue
} from '@chakra-ui/react'

// Custom components
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import ActivityLogRow from 'components/Tables/ActivityLogRow.js'

const ActivityLog = ({ captions, data, filterData }) => {
  const textColor = useColorModeValue('gray.700', 'white')

  return (
    <Card my='22px' overflowX={{ sm: 'scroll', xl: 'hidden' }}>
      <CardBody>
        <Table variant='simple' color={textColor} size='sm'>
          <Thead>
            <Tr my='.8rem' pl='0px'>
              {captions.map((caption, idx) => {
                return (
                  <Th color='gray.400' key={idx} ps={idx === 0 ? '0px' : null}>
                    {caption}
                  </Th>
                )
              })}
            </Tr>
          </Thead>
          <Tbody>
            {filterData.length > 0 &&
              filterData.map((row, index) => {
                return (
                  <ActivityLogRow
                    key={index}
                    type={row.type}
                    product={row.product}
                    version={row.version}
                    user={row.user}
                    notes={row.notes}
                    timestamp={row.timestamp}
                  />
                )
              })}
            {filterData.length === 0 &&
              data.map((row, index) => {
                return (
                  <ActivityLogRow
                    key={index}
                    type={row.type}
                    product={row.product}
                    version={row.version}
                    user={row.user}
                    notes={row.notes}
                    timestamp={row.timestamp}
                  />
                )
              })}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  )
}

export default ActivityLog
