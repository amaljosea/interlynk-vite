import React, { useState } from 'react'

import { Button, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { FormControl, FormLabel, Input } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'

import { useThemeColor } from 'hooks/useThemeColors'

const RiskFields = () => {
  const { inverseSecondaryBgColor } = useThemeColor(['inverseSecondaryBgColor'])

  const [repoInactivity, setRepoInactivity] = useState('365')
  const [versionInactivity, setVersionInactivity] = useState('365')
  const [versionRelease, setVersionRelease] = useState('365')

  return (
    <Stack spacing={6}>
      <SimpleGrid columns={2}>
        <Card p={0} boxShadow='none'>
          <CardHeader mb='12px'>
            <Text color={inverseSecondaryBgColor}>
              Consider the repository unmaintained after ALL of the following:
            </Text>
          </CardHeader>
          <CardBody mt={2}>
            <FormControl w={'400px'}>
              <FormLabel>Inactivity {`(Days)`}</FormLabel>
              <Input
                value={repoInactivity}
                onChange={(e) => setRepoInactivity(e.target.value)}
              />
            </FormControl>
          </CardBody>
        </Card>
        <Card p={0} boxShadow='none'>
          <CardHeader mb='12px'>
            <Text color={inverseSecondaryBgColor}>
              Consider the version unmaintained after ALL of the following:
            </Text>
          </CardHeader>
          <CardBody mt={2}>
            <Stack spacing={5}>
              <FormControl w={'400px'}>
                <FormLabel>Inactivity {`(Days)`}</FormLabel>
                <Input
                  value={versionInactivity}
                  onChange={(e) => setVersionInactivity(e.target.value)}
                />
              </FormControl>
              <FormControl w={'400px'}>
                <FormLabel>Version Release {`(Days)`}</FormLabel>
                <Input
                  value={versionRelease}
                  onChange={(e) => setVersionRelease(e.target.value)}
                />
              </FormControl>
            </Stack>
          </CardBody>
        </Card>
      </SimpleGrid>
      {/* ACTION */}
      <Button fontSize={'sm'} w={'fit-content'} colorScheme='blue'>
        Update
      </Button>
    </Stack>
  )
}

export default RiskFields
