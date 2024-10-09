import { useQuery } from '@apollo/client'
import styled from '@emotion/styled'
import { useParams } from 'react-router-dom'
import { getFullDateAndTime } from 'utils'
import { pkgData, pkgVersionData, repositoryData } from 'variables/general'

import { Divider, Flex, Skeleton, Spacer, Stack } from '@chakra-ui/react'
import { Tag, TagLabel, Text, Tooltip } from '@chakra-ui/react'
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
import CompInfo from 'components/Misc/CompInfo'

import { GetEnrichedData } from 'graphQL/Queries'

const Container = ({ children }) => {
  return (
    <Flex
      justifyContent={'space-between'}
      sx={{ w: '100%', gap: 6, alignItems: 'center', fontSize: 'sm' }}
    >
      {children}
    </Flex>
  )
}

const LynkTag = ({ value }) => {
  return (
    <Tag size='sm' colorScheme={value ? 'red' : 'green'} pt={1}>
      {value ? 'Yes' : 'No'}
    </Tag>
  )
}

const Label = styled(Text)`
  cursor: pointer;
`

const CompInsights = ({ isOpen, onClose, id }) => {
  const params = useParams()

  const { data, loading } = useQuery(GetEnrichedData, {
    skip: isOpen ? false : true,
    variables: { id: id, sbomId: params?.sbomid }
  })

  const { enrichedContent, healthScore } = data?.component || ''
  const { packageVersion, repository } = enrichedContent || ''

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
      return result[0]?.name
    } else {
      return ''
    }
  }

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
              <CompInfo data={data?.component} />
              <HealthScore isComponent value={healthScore} />
            </Flex>
          )}
        </DrawerHeader>
        <DrawerBody pb={5}>
          {loading ? (
            <CustomLoader />
          ) : (
            <Flex gap={4} mt={2} flexDir={'column'}>
              {/* PACKAGE */}
              <Text fontWeight={'semibold'}>Package</Text>
              {enrichedContent?.package ? (
                <Stack spacing={2}>
                  <Container>
                    <Tooltip label={onCheck('package', 'Deprecated')}>
                      <Label>Deprecated</Label>
                    </Tooltip>
                    <LynkTag value={enrichedContent?.package?.isDeprecated} />
                  </Container>
                  <Container>
                    <Tooltip label={onCheck('package', 'Last Updated')}>
                      <Label>Last Updated</Label>
                    </Tooltip>
                    <Text>
                      {getFullDateAndTime(enrichedContent?.package?.updatedAt)}
                    </Text>
                  </Container>
                </Stack>
              ) : (
                <Text color={'gray.500'}>Not available</Text>
              )}
              <Divider />
              {/* PACKAGE VERSION */}
              <Text fontWeight={'semibold'}>Package Version</Text>
              {packageVersion ? (
                <Stack spacing={2}>
                  <Container>
                    <Tooltip label={onCheck('packageVersion', 'License')}>
                      <Label>License</Label>
                    </Tooltip>
                    <Tag colorScheme='blue' maxW={'300px'}>
                      <TagLabel fontSize={'xs'}>
                        {getLicense(packageVersion?.license)}
                      </TagLabel>
                    </Tag>
                  </Container>
                  <Container>
                    <Tooltip label={onCheck('packageVersion', 'Deprecated')}>
                      <Label>Deprecated</Label>
                    </Tooltip>
                    <LynkTag value={packageVersion?.isDeprecated} />
                  </Container>
                  <Container>
                    <Tooltip label={onCheck('packageVersion', 'Archived')}>
                      <Label>Archived</Label>
                    </Tooltip>
                    <LynkTag value={packageVersion?.isArchived} />
                  </Container>
                  <Container>
                    <Tooltip label={onCheck('packageVersion', 'Pre-release')}>
                      <Label>Pre-release</Label>
                    </Tooltip>
                    <LynkTag value={packageVersion?.isPreRelease} />
                  </Container>
                  <Container>
                    <Tooltip label={onCheck('packageVersion', 'Outdated')}>
                      <Label>Outdated</Label>
                    </Tooltip>
                    <LynkTag value={packageVersion?.isOutdated} />
                  </Container>
                  <Container>
                    <Tooltip
                      label={onCheck('packageVersion', 'Most Recent Version')}
                    >
                      <Label>Most Recent Version</Label>
                    </Tooltip>
                    <Text>{packageVersion?.version}</Text>
                  </Container>
                  <Container>
                    <Tooltip label={onCheck('packageVersion', 'Last Updated')}>
                      <Label>Last Updated</Label>
                    </Tooltip>
                    <Text>{getFullDateAndTime(packageVersion?.updatedAt)}</Text>
                  </Container>
                </Stack>
              ) : (
                <Text color={'gray.500'}>Not available</Text>
              )}
              <Divider />
              {/* PACKAGE SOURCE */}
              <Text fontWeight={'semibold'}>Package Source Code</Text>
              {repository ? (
                <Stack spacing={2}>
                  <Container>
                    <Tooltip label={onCheck('repository', 'Name')}>
                      <Text>Name</Text>
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
                    <Text textAlign={'right'}>{repository?.description}</Text>
                  </Container>
                  <Container>
                    <Tooltip label={onCheck('repository', 'Source Archived')}>
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
                    <Tooltip label={onCheck('repository', 'OpenSSF Scorecard')}>
                      <Label>OpenSSF Scorecard</Label>
                    </Tooltip>
                    <Text>{repository?.scorecardScore}</Text>
                  </Container>
                  <Container>
                    <Tooltip label={onCheck('repository', 'License')}>
                      <Label>License</Label>
                    </Tooltip>
                    <Tag colorScheme='blue' maxW={'300px'}>
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
                <Text color={'gray.500'}>Not available</Text>
              )}
            </Flex>
          )}
          <Spacer mt={4} />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default CompInsights
