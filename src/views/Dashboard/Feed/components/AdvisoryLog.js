// Chakra imports
import {
  Box,
  Flex,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue
} from '@chakra-ui/react'
// Custom components
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import AdvisoryLogRow from 'components/Tables/AdvisoryLogRow.js'
import React from 'react'

const AdvisoryLog = ({ title, captions, data, filterData }) => {
  const textColor = useColorModeValue('gray.700', 'white')

  return (
    <Card my='22px' overflowX={{ sm: 'scroll', xl: 'hidden' }}>
      <CardBody>
        <Table variant='simple' color={textColor} size='sm'>
          <Thead>
            <Tr my='.8rem' pl='0px'>
              {captions.map((caption, idx) => {
                return (
                  <Th key={idx} ps={idx === 0 ? '0px' : null}>
                    <Box>{caption}</Box>
                  </Th>
                )
              })}
            </Tr>
          </Thead>
          <Tbody>
            {filterData.length > 0 &&
              filterData.map((row) => {
                return (
                  <AdvisoryLogRow
                    ID={row.ID}
                    desc={row.desc}
                    source={row.source}
                    updated={row.updated}
                    severity={row.severity}
                    affected={row.affected}
                    aliases={row.aliases}
                  />
                )
              })}
            {filterData.length === 0 &&
              data.map((row) => {
                return (
                  <AdvisoryLogRow
                    key={row.ID}
                    ID={row.ID}
                    desc={row.desc}
                    source={row.source}
                    updated={row.updated}
                    severity={row.severity}
                    affected={row.affected}
                    aliases={row.aliases}
                  />
                )
              })}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  )
}

export default AdvisoryLog
