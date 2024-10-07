import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { getFullDateAndTime } from 'utils'

import {
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Skeleton,
  Stack,
  Tag,
  Text
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
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

const CompInsights = ({ isOpen, onClose, id }) => {
  const params = useParams()

  const { data, loading } = useQuery(GetEnrichedData, {
    skip: isOpen ? false : true,
    variables: { id: id, sbomId: params?.sbomid }
  })

  const { enrichedContent } = data?.component || ''
  const { packageVersion, repository } = enrichedContent || ''

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
            <CompInfo data={data?.component} />
          )}
        </DrawerHeader>
        <DrawerBody>
          {loading ? (
            <CustomLoader />
          ) : (
            <Flex gap={4} flexDir={'column'}>
              {/* PACKAGE */}
              <Stack hidden={!enrichedContent?.package} spacing={3}>
                <Text fontWeight={'semibold'}>Package</Text>
                <Container>
                  <Text>Deprecated</Text>
                  <LynkTag value={enrichedContent?.package?.isDeprecated} />
                </Container>
                <Container>
                  <Text>Last Updated</Text>
                  <Text>
                    {getFullDateAndTime(enrichedContent?.package?.updatedAt)}
                  </Text>
                </Container>
              </Stack>
              <Divider hidden={!packageVersion} />
              {/* PACKAGE VERSION */}
              <Stack hidden={!packageVersion} spacing={3}>
                <Text fontWeight={'semibold'}>Package Version</Text>
                <Container>
                  <Text>Deprecated</Text>
                  <LynkTag value={packageVersion?.isDeprecated} />
                </Container>
                <Container>
                  <Text>Outdated</Text>
                  <LynkTag value={packageVersion?.isOutdated} />
                </Container>
                <Container>
                  <Text>Most Recent Version</Text>
                  <Text>{packageVersion?.version}</Text>
                </Container>
                <Container>
                  <Text>Pre-release</Text>
                  <LynkTag value={packageVersion?.isPreRelease} />
                </Container>
                <Container>
                  <Text>Archived</Text>
                  <LynkTag value={packageVersion?.isArchived} />
                </Container>
                <Container>
                  <Text>Last Updated</Text>
                  <Text>{getFullDateAndTime(packageVersion?.updatedAt)}</Text>
                </Container>
              </Stack>
              <Divider hidden={!repository} />
              {/* PACKAGE SOURCE */}
              <Stack hidden={!repository} spacing={3}>
                <Text fontWeight={'semibold'}>Package Source</Text>
                <Container>
                  <Text>Name</Text>
                  <Text>{repository?.name}</Text>
                </Container>
                <Container>
                  <Text>Owner</Text>
                  <Text>{repository?.owner}</Text>
                </Container>
                <Container>
                  <Text>URL</Text>
                  <Text>{repository?.url}</Text>
                </Container>
                <Container>
                  <Text>Description</Text>
                  <Text>{repository?.description}</Text>
                </Container>
                <Container>
                  <Text>Source Archived</Text>
                  <LynkTag value={repository?.isArchived} />
                </Container>
                <Container>
                  <Text>Stars</Text>
                  <Text>{repository?.starsCount}</Text>
                </Container>
                <Container>
                  <Text>Forks</Text>
                  <Text>{repository?.forksCount}</Text>
                </Container>
                <Container>
                  <Text>Watchers</Text>
                  <Text>{repository?.watchersCount}</Text>
                </Container>
                <Container>
                  <Text>Contibutors</Text>
                  <Text>{repository?.contributorCount}</Text>
                </Container>
                <Container>
                  <Text>Relases</Text>
                  <Text>{repository?.releases}</Text>
                </Container>
                <Container>
                  <Text>Issues</Text>
                  <Text>{repository?.issues}</Text>
                </Container>
                <Container>
                  <Text>OpenSSF Scorecard</Text>
                  <Text>{repository?.scorecardScore}</Text>
                </Container>
                <Container>
                  <Text>License</Text>
                  <Text>{repository?.license}</Text>
                </Container>
                <Container>
                  <Text>Last Updated</Text>
                  <Text>{getFullDateAndTime(repository?.updatedAt)}</Text>
                </Container>
              </Stack>
            </Flex>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default CompInsights
