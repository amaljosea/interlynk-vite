import { Flex, Input } from '@chakra-ui/react'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import TeamTable from 'components/Tables/TeamTable'
import React from 'react'

const TeamsLog = ({ data }) => {
  return (
    <Card p={0}>
      <CardHeader>
        <Input
          placeholder='Search'
          width={'400px'}
          size='md'
          id='vulnerabilities'
        />
      </CardHeader>
      <CardBody py={4}>
        <TeamTable data={data} />
      </CardBody>
    </Card>
  )
}

export default TeamsLog
