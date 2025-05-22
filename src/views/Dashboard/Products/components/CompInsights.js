import { useQuery } from '@apollo/client'
import { getFullDateTime, timeSince } from 'utils'
import { getHealthScore, getTotalHealthScore } from 'utils/healthScoreUtils'

import { SimpleGrid, Skeleton, Spacer, Stack } from '@chakra-ui/react'
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'
import { Box, Tag, TagLabel, Text, Tooltip } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import LynkDrawer from 'components/LynkDrawer'
import CompInfo from 'components/Misc/CompInfo'

import { useThemeColor } from 'hooks/useThemeColors'

import { GetEnrichedData } from 'graphQL/Queries'

const Container = ({ children }) => {
  const { grayBorderColor } = useThemeColor(['grayBorderColor'])

  return (
    <SimpleGrid
      pb={2}
      columns={2}
      spacing={4}
      fontSize={'sm'}
      borderBottom={`1px solid ${grayBorderColor}`}
    >
      {children}
    </SimpleGrid>
  )
}

const LynkTag = ({ value }) => {
  return (
    <Tag size='sm' w={'fit-content'} colorScheme={value ? 'red' : 'green'}>
      {value ? 'Yes' : 'No'}
    </Tag>
  )
}

const DateField = ({ value }) => {
  if (!value) return 'N/A'
  return (
    <Tooltip placement='top' label={getFullDateTime(value)}>
      <Text width={'fit-content'} cursor={'pointer'}>
        {timeSince(value)}
      </Text>
    </Tooltip>
  )
}

const HealthScore = ({ scores }) => {
  const { sameSecondaryText } = useThemeColor(['sameSecondaryText'])

  if (scores?.age) {
    const { age, community, security } = scores || {}

    const data = [
      { id: 1, label: 'Age Score', value: getHealthScore(age) },
      {
        id: 2,
        label: 'Community Score',
        value: getHealthScore(community)
      },
      {
        id: 3,
        label: 'Security Score',
        value: getHealthScore(security)
      },
      {
        id: 4,
        label: 'Total Score',
        value: getTotalHealthScore(age, community, security)
      }
    ]

    return (
      <Stack>
        {data?.map((item) => (
          <Container key={item?.id}>
            <Text>{item?.label}</Text>
            <Text>{item?.value}</Text>
          </Container>
        ))}
      </Stack>
    )
  }

  return (
    <Text textAlign={'center'} color={sameSecondaryText}>
      Not available
    </Text>
  )
}

const CompInsights = ({ isOpen, onClose, data }) => {
  const { id, scores } = data || {}

  const { sameSecondaryText } = useThemeColor(['sameSecondaryText'])
  const { secondaryBgColor } = useThemeColor(['secondaryBgColor'])

  const { data: insights, loading } = useQuery(GetEnrichedData, {
    skip: isOpen ? false : true,
    variables: { id: id, sbomId: data?.sbomId },
    errorPolicy: 'all'
  })

  const { enrichedContent } = insights?.component || ''
  const { packageVersion, latestPackageVersion, repository } =
    enrichedContent || {}

  const getLicense = (item) => {
    if (!item) return 'N/A'

    const result = JSON.parse(item)
    if (result?.length > 0) {
      return result[0]?.name !== '' ? result[0]?.name : 'N/A'
    } else {
      return 'N/A'
    }
  }

  const tabs = ['Package', 'Version', 'Source Code', 'Health Score']

  const packageData = [
    {
      id: 1,
      label: 'Most Recent Version',
      value: <Text>{latestPackageVersion?.version || 'N/A'}</Text>
    },
    {
      id: 2,
      label: 'Deprecated',
      value: <LynkTag value={enrichedContent?.package?.isDeprecated || 'N/A'} />
    },
    {
      id: 3,
      label: 'Last Checked',
      value: <DateField value={enrichedContent?.package?.updatedAt} />
    }
  ]

  const packageVersionData = [
    {
      id: 1,
      label: 'Version',
      value: <Text>{packageVersion?.version || 'N/A'}</Text>
    },
    {
      id: 2,
      label: 'License',
      value: <Text>{getLicense(packageVersion?.license)}</Text>
    },
    {
      id: 3,
      label: 'Deprecated',
      value: <LynkTag value={packageVersion?.isDeprecated || 'N/A'} />
    },
    {
      id: 4,
      label: 'Archived',
      value: <LynkTag value={packageVersion?.isArchived || 'N/A'} />
    },
    {
      id: 5,
      label: 'Pre-release',
      value: <LynkTag value={packageVersion?.isPreRelease || 'N/A'} />
    },
    {
      id: 6,
      label: 'Outdated',
      value: <LynkTag value={packageVersion?.isOutdated || 'N/A'} />
    },
    {
      id: 7,
      label: 'Published',
      value: <DateField value={packageVersion?.publishedAt} />
    },
    {
      id: 8,
      label: 'Last Checked',
      value: <DateField value={packageVersion?.updatedAt} />
    }
  ]

  const sourceCodeData = [
    {
      id: 1,
      label: 'Name',
      value: <Text>{repository?.name || 'N/A'}</Text>
    },
    {
      id: 2,
      label: 'Owner',
      value: <Text>{repository?.owner || 'N/A'}</Text>
    },
    {
      id: 3,
      label: 'Description',
      value: <Text>{repository?.description || 'N/A'}</Text>
    },
    {
      id: 4,
      label: 'Source Archived',
      value: <LynkTag value={repository?.isArchived || 'N/A'} />
    },
    {
      id: 5,
      label: 'Stars',
      value: <Text>{repository?.starsCount || 'N/A'}</Text>
    },
    {
      id: 6,
      label: 'Forks',
      value: <Text>{repository?.forksCount || 'N/A'}</Text>
    },
    {
      id: 7,
      label: 'Last Commit',
      value: <DateField value={repository?.lastCommitDate} />
    },
    {
      id: 8,
      label: 'Contibutors',
      value: <Text>{repository?.contributorCount || 'N/A'}</Text>
    },
    {
      id: 9,
      label: 'Last Merged',
      value: <DateField value={repository?.lastMergedPrDate} />
    },
    {
      id: 10,
      label: 'Last Relasesd',
      value: <DateField value={repository?.lastReleaseDate} />
    },
    {
      id: 11,
      label: 'Last Repo Update',
      value: <DateField value={repository?.lastRepoUpdateDate} />
    },
    {
      id: 12,
      label: 'OpenSSF Scorecard',
      value: <Text>{repository?.scorecardScore || 'N/A'}</Text>
    },
    {
      id: 13,
      label: 'License',
      value: (
        <Tag colorScheme='blue' w='fit-content'>
          <TagLabel fontSize={'xs'}>{getLicense(repository?.license)}</TagLabel>
        </Tag>
      )
    },
    {
      id: 14,
      label: 'Last Checked',
      value: <DateField value={repository?.updatedAt} />
    }
  ]

  return (
    <LynkDrawer
      title={'Insights'}
      subtitle={
        loading ? (
          <Skeleton mt={2} w={'50%'} h={3} />
        ) : (
          insights && <CompInfo data={insights?.component || ''} />
        )
      }
      isOpen={isOpen}
      onClose={onClose}
      noFooter
    >
      {loading ? (
        <Box py={2}>
          <CustomLoader />
        </Box>
      ) : (
        <Tabs
          position={'fixed'}
          w={'100%'}
          left={0}
          top={!insights ? '60px' : '90px'}
          isFitted
          defaultIndex={1}
        >
          <TabList bg={secondaryBgColor} zIndex={11}>
            {tabs.map((item, index) => (
              <Tab
                key={index}
                fontSize={'sm'}
                _focus={{ outline: 'none', bg: 'none' }}
                sx={{ py: 3.5, textTransform: 'capitalize' }}
              >
                {item}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            {/* PACKAGE */}
            <TabPanel>
              {enrichedContent?.package ? (
                <Stack>
                  {packageData?.map((item) => (
                    <Container key={item?.id}>
                      <Text>{item?.label}</Text>
                      {item?.value}
                    </Container>
                  ))}
                </Stack>
              ) : (
                <Text textAlign={'center'} color={sameSecondaryText}>
                  Not available
                </Text>
              )}
            </TabPanel>
            {/* PACKAGE VERSION */}
            <TabPanel>
              {packageVersion ? (
                <Stack>
                  {packageVersionData?.map((item) => (
                    <Container key={item?.id}>
                      <Text>{item?.label}</Text>
                      {item?.value}
                    </Container>
                  ))}
                </Stack>
              ) : (
                <Text textAlign={'center'} color={sameSecondaryText}>
                  Not available
                </Text>
              )}
            </TabPanel>
            {/* SOURCE CODE */}
            <TabPanel>
              {repository ? (
                <Stack>
                  {sourceCodeData?.map((item) => (
                    <Container key={item?.id}>
                      <Text>{item?.label}</Text>
                      {item?.value}
                    </Container>
                  ))}
                </Stack>
              ) : (
                <Text textAlign={'center'} color={sameSecondaryText}>
                  Not available
                </Text>
              )}
            </TabPanel>
            {/* HEALTH SCORE */}
            <TabPanel>
              <HealthScore scores={scores} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
      <Spacer mt={4} />
    </LynkDrawer>
  )
}

export default CompInsights
