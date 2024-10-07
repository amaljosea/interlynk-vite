import React from 'react'

import { Table, Tbody, Text, Th, Thead, Tr } from '@chakra-ui/react'

// Custom components
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import CardHeader from 'components/Card/CardHeader.js'
import TablesTableRow from 'components/Tables/TablesTableRow'

import { useThemeColor } from 'hooks/useThemeColors'

const Authors = ({ title, captions, data }) => {
  const { inverseSecondaryBgColor, secondaryTextColor } = useThemeColor([
    'inverseSecondaryBgColor',
    'secondaryTextColor'
  ])

  return (
    <Card overflowX={{ sm: 'scroll', xl: 'hidden' }}>
      <CardHeader p='6px 0px 22px 0px'>
        <Text fontSize='xl' color={inverseSecondaryBgColor} fontWeight='bold'>
          {title}
        </Text>
      </CardHeader>
      <CardBody>
        <Table variant='simple' color={inverseSecondaryBgColor}>
          <Thead>
            <Tr my='.8rem' pl='0px' color={secondaryTextColor}>
              {captions.map((caption, idx) => {
                return (
                  <Th
                    color={secondaryTextColor}
                    key={idx}
                    ps={idx === 0 ? '0px' : null}
                  >
                    {caption}
                  </Th>
                )
              })}
            </Tr>
          </Thead>
          <Tbody>
            {data.map((row) => {
              return (
                <TablesTableRow
                  key={`${row.email}-${row.name}`}
                  name={row.name}
                  logo={row.logo}
                  email={row.email}
                  subdomain={row.subdomain}
                  domain={row.domain}
                  status={row.status}
                  date={row.date}
                />
              )
            })}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  )
}

export default Authors
