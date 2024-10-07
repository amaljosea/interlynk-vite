import React from 'react'

import { Flex, Table, Tbody, Text, Th, Thead, Tr } from '@chakra-ui/react'

// Custom components
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import CardHeader from 'components/Card/CardHeader.js'
import TablesProjectRow from 'components/Tables/TablesProjectRow'

import { useThemeColor } from 'hooks/useThemeColors'

const Projects = ({ title, captions, data }) => {
  const { inverseSecondaryBgColor, secondaryTextColor } = useThemeColor([
    'inverseSecondaryBgColor',
    'secondaryTextColor'
  ])
  return (
    <Card my='22px' overflowX={{ sm: 'scroll', xl: 'hidden' }}>
      <CardHeader p='6px 0px 22px 0px'>
        <Flex direction='column'>
          <Text
            fontSize='lg'
            color={inverseSecondaryBgColor}
            fontWeight='bold'
            pb='.5rem'
          >
            {title}
          </Text>
        </Flex>
      </CardHeader>
      <CardBody>
        <Table variant='simple' color={inverseSecondaryBgColor}>
          <Thead>
            <Tr my='.8rem' pl='0px'>
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
                <TablesProjectRow
                  key={row.name}
                  name={row.name}
                  logo={row.logo}
                  status={row.status}
                  budget={row.budget}
                  progression={row.progression}
                />
              )
            })}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  )
}

export default Projects
