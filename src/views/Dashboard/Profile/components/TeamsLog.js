import { Flex, Input } from '@chakra-ui/react'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import TeamTable from 'components/Tables/TeamTable'
import React from 'react'

const TeamsLog = () => {
  const teamMemebers = [
    {
      id: 1,
      name: 'Surendra Pathak',
      email: 'sp@interlynk.io',
      auth: 'GitHub',
      role: 'Org Admin',
      joinedDate: '2023-07-20T12:30:00Z'
    },
    {
      id: 2,
      name: 'Ritesh Noronha',
      email: 'rcn@interlynk.io',
      auth: 'Google',
      role: 'Org Admin',
      joinedDate: '2023-06-27T09:44:00Z'
    },
    {
      id: 3,
      name: 'Abhisek Paul',
      email: 'abhisek@interlynk.io',
      auth: 'GitLab',
      role: 'Vulnerability Manager',
      joinedDate: '2023-05-19T18:24:00Z'
    }
  ]

  return (
    <Card p={0}>
      <CardHeader p='12px 0' mb='12px'>
        <Input
          placeholder='Search'
          width={'300px'}
          size='md'
          id='vulnerabilities'
        />
      </CardHeader>
      <CardBody px='5px'>
        <TeamTable data={teamMemebers} />
      </CardBody>
    </Card>
  )
}

export default TeamsLog
