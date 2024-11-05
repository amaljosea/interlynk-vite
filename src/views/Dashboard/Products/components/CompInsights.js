import { useQuery } from '@apollo/client'
import styled from '@emotion/styled'
import { useParams } from 'react-router-dom'
import { getFullDateAndTime, truncatedValue } from 'utils'
import { pkgData, pkgVersionData, repositoryData } from 'variables/general'

import { Flex, SimpleGrid, Skeleton, Spacer, Stack } from '@chakra-ui/react'
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'
import { Box, Tag, TagLabel, Text, Tooltip } from '@chakra-ui/react'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import { HealthScore } from 'components/HealthScore'

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
    <Tag
      size='sm'
      sx={{ w: 'fit-content', pt: 1 }}
      colorScheme={value ? 'red' : 'green'}
    >
      {value ? 'Yes' : 'No'}
    </Tag>
  )
}

const Label = styled(Text)`
  cursor: pointer;
`

const CompInsights = ({ isOpen, onClose, id }) => {
  const { sameSecondaryText } = useThemeColor(['sameSecondaryText'])
  const params = useParams()
  const { secondaryBgColor } = useThemeColor(['secondaryBgColor'])

  const { data, loading } = useQuery(GetEnrichedData, {
    skip: isOpen ? false : true,
    variables: { id: id, sbomId: params?.sbomid }
  })

  const { enrichedContent, healthScore } = data?.component || ''
  const { latestPackageVersion, repository } = enrichedContent || ''

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

  const tabs = ['Package', 'Version', 'Source Code']

  return (
    <Drawer size='md' isOpen={isOpen} placement='right' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={3} />
        <DrawerHeader borderBottomWidth='1px'>
          <Text fontWeight={'medium'}>Insights</Text>
          {loading ? (
            <Skeleton mt={2} w={'50%'} h={3} />
          ) : (
            <Flex alignItems={'center'} gap={2} justifyContent={'flex-start'}>
              <Text fontWeight={'normal'} fontSize={'sm'}>
                {truncatedValue(data?.component?.name, 15)} -{' '}
                {truncatedValue(data?.component?.version, 15)}
              </Text>
              <HealthScore isComponent value={healthScore} />
            </Flex>
          )}
        </DrawerHeader>
        <DrawerBody p={0}>
          {loading ? (
            <Box px={5}>
              <CustomLoader />
            </Box>
          ) : (
            <Tabs isFitted>
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
              <TabPanels px={2}>
                <TabPanel>
                  {enrichedContent?.package ? (
                    <Stack spacing={3}>
                      <Container>
                        <Tooltip label={onCheck('package', 'Deprecated')}>
                          <Label>Deprecated</Label>
                        </Tooltip>
                        <LynkTag
                          value={enrichedContent?.package?.isDeprecated}
                        />
                      </Container>
                      <Container>
                        <Tooltip label={onCheck('package', 'Last Updated')}>
                          <Label>Last Updated</Label>
                        </Tooltip>
                        <Text>
                          {getFullDateAndTime(
                            enrichedContent?.package?.updatedAt
                          )}
                        </Text>
                      </Container>
                    </Stack>
                  ) : (
                    <Text color={sameSecondaryText}>Not available</Text>
                  )}
                </TabPanel>
                <TabPanel>
                  {latestPackageVersion ? (
                    <Stack spacing={3}>
                      <Container>
                        <Tooltip label={onCheck('packageVersion', 'License')}>
                          <Label>License</Label>
                        </Tooltip>
                        <Text>{getLicense(latestPackageVersion?.license)}</Text>
                      </Container>
                      <Container>
                        <Tooltip
                          label={onCheck('packageVersion', 'Deprecated')}
                        >
                          <Label>Deprecated</Label>
                        </Tooltip>
                        <LynkTag value={latestPackageVersion?.isDeprecated} />
                      </Container>
                      <Container>
                        <Tooltip label={onCheck('packageVersion', 'Archived')}>
                          <Label>Archived</Label>
                        </Tooltip>
                        <LynkTag value={latestPackageVersion?.isArchived} />
                      </Container>
                      <Container>
                        <Tooltip
                          label={onCheck('packageVersion', 'Pre-release')}
                        >
                          <Label>Pre-release</Label>
                        </Tooltip>
                        <LynkTag value={latestPackageVersion?.isPreRelease} />
                      </Container>
                      <Container>
                        <Tooltip label={onCheck('packageVersion', 'Outdated')}>
                          <Label>Outdated</Label>
                        </Tooltip>
                        <LynkTag value={latestPackageVersion?.isOutdated} />
                      </Container>
                      <Container>
                        <Tooltip
                          label={onCheck(
                            'packageVersion',
                            'Most Recent Version'
                          )}
                        >
                          <Label>Most Recent Version</Label>
                        </Tooltip>
                        <Text>{latestPackageVersion?.version}</Text>
                      </Container>
                      <Container>
                        <Tooltip
                          label={onCheck('packageVersion', 'Last Updated')}
                        >
                          <Label>Last Updated</Label>
                        </Tooltip>
                        <Text>
                          {getFullDateAndTime(latestPackageVersion?.updatedAt)}
                        </Text>
                      </Container>
                    </Stack>
                  ) : (
                    <Text color={sameSecondaryText}>Not available</Text>
                  )}
                </TabPanel>
                <TabPanel>
                  {repository ? (
                    <Stack spacing={3}>
                      <Container>
                        <Tooltip label={onCheck('repository', 'Name')}>
                          <Label>Name</Label>
                        </Tooltip>
                        <Text>{repository?.name}</Text>
                      </Container>
                      <Container>
                        <Tooltip label={onCheck('repository', 'Owner')}>
                          <Label>Owner</Label>
                        </Tooltip>
                        <Text>{repository?.owner}</Text>
                      </Container>
                      <Container>
                        <Tooltip label={onCheck('repository', 'Description')}>
                          <Label>Description</Label>
                        </Tooltip>
                        <Text>{repository?.description}</Text>
                      </Container>
                      <Container>
                        <Tooltip
                          label={onCheck('repository', 'Source Archived')}
                        >
                          <Label>Source Archived</Label>
                        </Tooltip>
                        <LynkTag value={repository?.isArchived} />
                      </Container>
                      <Container>
                        <Tooltip label={onCheck('repository', 'Stars')}>
                          <Label>Stars</Label>
                        </Tooltip>
                        <Text>{repository?.starsCount}</Text>
                      </Container>
                      <Container>
                        <Tooltip label={onCheck('repository', 'Forks')}>
                          <Label>Forks</Label>
                        </Tooltip>
                        <Text>{repository?.forksCount}</Text>
                      </Container>
                      <Container>
                        <Tooltip label={onCheck('repository', 'Watchers')}>
                          <Label>Watchers</Label>
                        </Tooltip>
                        <Text>{repository?.watchersCount}</Text>
                      </Container>
                      <Container>
                        <Tooltip label={onCheck('repository', 'Contibutors')}>
                          <Label>Contibutors</Label>
                        </Tooltip>
                        <Text>{repository?.contributorCount}</Text>
                      </Container>
                      <Container>
                        <Tooltip label={onCheck('repository', 'Relases')}>
                          <Label>Relases</Label>
                        </Tooltip>
                        <Text>{JSON.stringify(repository?.releases)}</Text>
                      </Container>
                      <Container>
                        <Tooltip label={onCheck('repository', 'Issues')}>
                          <Label>Issues</Label>
                        </Tooltip>
                        <Text>{JSON.stringify(repository?.issues)}</Text>
                      </Container>
                      <Container>
                        <Tooltip
                          label={onCheck('repository', 'OpenSSF Scorecard')}
                        >
                          <Label>OpenSSF Scorecard</Label>
                        </Tooltip>
                        <Text>{repository?.scorecardScore}</Text>
                      </Container>
                      <Container>
                        <Tooltip label={onCheck('repository', 'License')}>
                          <Label>License</Label>
                        </Tooltip>
                        <Tag colorScheme='blue' w='fit-content'>
                          <TagLabel fontSize={'xs'}>
                            {getLicense(repository?.license)}
                          </TagLabel>
                        </Tag>
                      </Container>
                      <Container>
                        <Tooltip label={onCheck('repository', 'Last Updated')}>
                          <Label>Last Updated</Label>
                        </Tooltip>
                        <Text>{getFullDateAndTime(repository?.updatedAt)}</Text>
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
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default CompInsights
