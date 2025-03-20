import { useQuery } from '@apollo/client'
import { getFullDateTime, timeSince } from 'utils'
import { pkgData, pkgVersionData, repositoryData } from 'variables/general'

import { Divider, SimpleGrid, Skeleton, Spacer, Stack } from '@chakra-ui/react'
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'
import { Box, Tag, TagLabel, Text, Tooltip } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import LynkDrawer from 'components/LynkDrawer'
import CompInfo from 'components/Misc/CompInfo'

import { useThemeColor } from 'hooks/useThemeColors'

import { GetEnrichedData } from 'graphQL/Queries'

const Container = ({ children }) => {
  return (
    <SimpleGrid columns={2} spacing={4} fontSize={'sm'}>
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

const CompInsights = ({ isOpen, onClose, data }) => {
  const { id, scores } = data || ''
  const { sameSecondaryText } = useThemeColor(['sameSecondaryText'])
  const { secondaryBgColor } = useThemeColor(['secondaryBgColor'])

  const { age, community, security } = scores || ''
  const ageScore = Math.round(age)
  const communityScore = Math.round(community)
  const securityScore = Math.round(security)

  const { data: insights, loading } = useQuery(GetEnrichedData, {
    skip: isOpen ? false : true,
    variables: { id: id, sbomId: data?.sbomId }
  })

  const { enrichedContent } = insights?.component || ''
  const { packageVersion, latestPackageVersion, repository } =
    enrichedContent || ''

  const onCheck = (category, title) => {
    if (category === 'package') {
      const result = pkgData.find((item) => item?.title === title)
      return result?.desc
    } else if (category === 'packageVersion') {
      const result = pkgVersionData.find((item) => item?.title === title)
      return result?.desc
    } else if (category === 'repository') {
      const result = repositoryData.find((item) => item?.title === title)
      return result?.desc
    }
  }

  const getLicense = (item) => {
    const result = JSON.parse(item)
    if (result?.length > 0) {
      return result[0]?.name !== '' ? result[0]?.name : 'N/A'
    } else {
      return 'N/A'
    }
  }

  const tabs = ['Package', 'Version', 'Source Code', 'Health Score']

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
        <Box px={5}>
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
                  <Container>
                    <Tooltip
                      label={onCheck('packageVersion', 'Most Recent Version')}
                    >
                      <Text cursor={'pointer'}>Most Recent Version</Text>
                    </Tooltip>
                    <Text>{latestPackageVersion?.version}</Text>
                  </Container>
                  <Divider />
                  <Container>
                    <Tooltip label={onCheck('package', 'Deprecated')}>
                      <Text cursor={'pointer'}>Deprecated</Text>
                    </Tooltip>
                    <LynkTag value={enrichedContent?.package?.isDeprecated} />
                  </Container>
                  <Divider />
                  <Container>
                    <Tooltip label={onCheck('packageVersion', 'Last Checked')}>
                      <Text cursor={'pointer'}>Last Checked</Text>
                    </Tooltip>
                    <DateField value={enrichedContent?.package?.updatedAt} />
                  </Container>
                </Stack>
              ) : (
                <Text color={sameSecondaryText}>Not available</Text>
              )}
            </TabPanel>
            {/* PACKAGE VERSION */}
            <TabPanel>
              {packageVersion ? (
                <Stack>
                  <Container>
                    <Text>Version</Text>
                    <Text>{packageVersion?.version}</Text>
                  </Container>
                  <Divider />
                  <Container>
                    <Tooltip label={onCheck('packageVersion', 'License')}>
                      <Text cursor={'pointer'}>License</Text>
                    </Tooltip>
                    <Text>{getLicense(packageVersion?.license)}</Text>
                  </Container>
                  <Divider />
                  <Container>
                    <Tooltip label={onCheck('packageVersion', 'Deprecated')}>
                      <Text cursor={'pointer'}>Deprecated</Text>
                    </Tooltip>
                    <LynkTag value={packageVersion?.isDeprecated} />
                  </Container>
                  <Divider />
                  <Container>
                    <Tooltip label={onCheck('packageVersion', 'Archived')}>
                      <Text cursor={'pointer'}>Archived</Text>
                    </Tooltip>
                    <LynkTag value={packageVersion?.isArchived} />
                  </Container>
                  <Divider />
                  <Container>
                    <Tooltip label={onCheck('packageVersion', 'Pre-release')}>
                      <Text cursor={'pointer'}>Pre-release</Text>
                    </Tooltip>
                    <LynkTag value={packageVersion?.isPreRelease} />
                  </Container>
                  <Divider />
                  <Container>
                    <Tooltip label={onCheck('packageVersion', 'Outdated')}>
                      <Text cursor={'pointer'}>Outdated</Text>
                    </Tooltip>
                    <LynkTag value={packageVersion?.isOutdated} />
                  </Container>
                  <Divider />
                  <Container>
                    <Tooltip label={onCheck('packageVersion', 'Published')}>
                      <Text cursor={'pointer'}>Published</Text>
                    </Tooltip>
                    <DateField value={packageVersion?.publishedAt} />
                  </Container>
                  <Divider />
                  <Container>
                    <Tooltip label={onCheck('packageVersion', 'Last Checked')}>
                      <Text cursor={'pointer'}>Last Checked</Text>
                    </Tooltip>
                    <DateField value={packageVersion?.updatedAt} />
                  </Container>
                </Stack>
              ) : (
                <Text color={sameSecondaryText}>Not available</Text>
              )}
            </TabPanel>
            {/* SOURCE CODE */}
            <TabPanel>
              {repository ? (
                <Stack>
                  <Container>
                    <Tooltip label={onCheck('repository', 'Name')}>
                      <Text cursor={'pointer'}>Name</Text>
                    </Tooltip>
                    <Text>{repository?.name}</Text>
                  </Container>
                  <Divider />
                  <Container>
                    <Tooltip label={onCheck('repository', 'Owner')}>
                      <Text cursor={'pointer'}>Owner</Text>
                    </Tooltip>
                    <Text>{repository?.owner}</Text>
                  </Container>
                  <Divider />
                  <Container>
                    <Tooltip label={onCheck('repository', 'Description')}>
                      <Text cursor={'pointer'}>Description</Text>
                    </Tooltip>
                    <Text>{repository?.description}</Text>
                  </Container>
                  <Divider />
                  <Container>
                    <Tooltip label={onCheck('repository', 'Source Archived')}>
                      <Text cursor={'pointer'}>Source Archived</Text>
                    </Tooltip>
                    <LynkTag value={repository?.isArchived} />
                  </Container>
                  <Divider />
                  <Container>
                    <Tooltip label={onCheck('repository', 'Stars')}>
                      <Text cursor={'pointer'}>Stars</Text>
                    </Tooltip>
                    <Text>{repository?.starsCount}</Text>
                  </Container>
                  <Divider />
                  <Container>
                    <Tooltip label={onCheck('repository', 'Forks')}>
                      <Text cursor={'pointer'}>Forks</Text>
                    </Tooltip>
                    <Text>{repository?.forksCount}</Text>
                  </Container>
                  <Divider />
                  <Container>
                    <Tooltip label={onCheck('repository', 'Last Commit')}>
                      <Text cursor={'pointer'}>Last Commit</Text>
                    </Tooltip>
                    <DateField value={repository?.lastCommitDate} />
                  </Container>
                  <Divider />
                  <Container>
                    <Tooltip label={onCheck('repository', 'Contibutors')}>
                      <Text cursor={'pointer'}>Contibutors</Text>
                    </Tooltip>
                    <Text>{repository?.contributorCount}</Text>
                  </Container>
                  <Divider />
                  <Container>
                    <Tooltip label={onCheck('repository', 'Last Merged')}>
                      <Text cursor={'pointer'}>Last Merged</Text>
                    </Tooltip>
                    <DateField value={repository?.lastMergedPrDate} />
                  </Container>
                  <Divider />
                  <Container>
                    <Tooltip label={onCheck('repository', 'Relases')}>
                      <Text cursor={'pointer'}>Last Relasesd</Text>
                    </Tooltip>
                    <DateField value={repository?.lastReleaseDate} />
                  </Container>
                  <Divider />
                  <Container>
                    <Tooltip label={onCheck('repository', 'Last Repo Update')}>
                      <Text cursor={'pointer'}>Last Repo Update</Text>
                    </Tooltip>
                    <DateField value={repository?.lastRepoUpdateDate} />
                  </Container>
                  <Divider />
                  <Container>
                    <Tooltip label={onCheck('repository', 'OpenSSF Scorecard')}>
                      <Text cursor={'pointer'}>OpenSSF Scorecard</Text>
                    </Tooltip>
                    <Text>{repository?.scorecardScore}</Text>
                  </Container>
                  <Divider />
                  <Container>
                    <Tooltip label={onCheck('repository', 'License')}>
                      <Text cursor={'pointer'}>License</Text>
                    </Tooltip>
                    <Tag colorScheme='blue' w='fit-content'>
                      <TagLabel fontSize={'xs'}>
                        {getLicense(repository?.license)}
                      </TagLabel>
                    </Tag>
                  </Container>
                  <Divider />
                  <Container>
                    <Tooltip label={onCheck('repository', 'Last Checked')}>
                      <Text cursor={'pointer'}>Last Checked</Text>
                    </Tooltip>
                    <DateField value={repository?.updatedAt} />
                  </Container>
                </Stack>
              ) : (
                <Text color={sameSecondaryText}>Not available</Text>
              )}
            </TabPanel>
            {/* HEALTH SCORE */}
            <TabPanel>
              {scores?.age ? (
                <Stack>
                  <Container>
                    <Text>Age Score</Text>
                    <Text>{ageScore}%</Text>
                  </Container>
                  <Divider />
                  <Container>
                    <Text>Community Score</Text>
                    <Text>{communityScore}%</Text>
                  </Container>
                  <Divider />
                  <Container>
                    <Text>Security Score</Text>
                    <Text>{securityScore}%</Text>
                  </Container>
                  <Divider />
                  <Container>
                    <Text>Total Score</Text>
                    <Text>{ageScore + communityScore + securityScore}%</Text>
                  </Container>
                </Stack>
              ) : (
                <Text color={sameSecondaryText}>Not available</Text>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
      <Spacer mt={4} />
    </LynkDrawer>
  )
}

export default CompInsights
