import { gql, useQuery } from '@apollo/client'
import { useState } from 'react'

import { Box, Center, Flex, Text, useDisclosure } from '@chakra-ui/react'

import CpeCard from 'components/Misc/CpeCard'
import LynkLoader from 'components/Misc/LynkLoader'
import PurlCard from 'components/Misc/PurlCard'
import ActivitiesOverviewRow from 'components/Tables/ActivitiesOverviewRow'

import { useGlobalState } from 'hooks/useGlobalState'

export const GetLatestActivity = gql`
  query GetLatestActivity($env: String) {
    organizationMetric(envName: $env) {
      latestActivity {
        event
        updatedAt
        changedBy
        action
        orig
        updated
      }
    }
  }
`

const ActivitiesOverview = () => {
  const { organization, envName } = useGlobalState()

  const { data, loading } = useQuery(GetLatestActivity, {
    skip: organization ? false : true,
    variables: { env: envName }
  })
  const { latestActivity } = data?.organizationMetric || {}

  const [activeRow, setActiveRow] = useState('')

  const PURL = useDisclosure()
  const CPE = useDisclosure()

  if (loading) return <LynkLoader />

  if (latestActivity?.length === 0) {
    return (
      <Center h='100%' py={12}>
        <Text>There are no records to display</Text>
      </Center>
    )
  }

  return (
    <>
      <Box ps='20px' pe='0px' maxH='100%' position='relative'>
        <Flex direction='column'>
          {latestActivity?.length > 0 &&
            latestActivity?.map((row, index) => (
              <ActivitiesOverviewRow
                key={index}
                event={row.event}
                orig={row.orig}
                updated={row.updated}
                changedBy={row.changedBy}
                date={row.updatedAt}
                index={index}
                arrLength={latestActivity?.length}
                action={row.action}
                onOpen={PURL.onOpen}
                onCpeOpen={CPE.onOpen}
                setActiveRow={setActiveRow}
              />
            ))}
        </Flex>
      </Box>

      {PURL.isOpen && (
        <PurlCard
          value={activeRow}
          isOpen={PURL.isOpen}
          onClose={PURL.onClose}
        />
      )}

      {CPE.isOpen && (
        <CpeCard value={activeRow} isOpen={CPE.isOpen} onClose={CPE.onClose} />
      )}
    </>
  )
}

export default ActivitiesOverview
