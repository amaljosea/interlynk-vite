import { useLazyQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { getDateFormat } from 'utils'
import { severityList } from 'variables/general'

import { RepeatIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Spacer,
  Tooltip
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardHeader from 'components/Card/CardHeader'

import { GetFeedLogs } from 'graphQL/Queries'

import { FaDownload, FaFilter, FaSlack } from 'react-icons/fa'

import AdvisoryLog from './components/AdvisoryLog'
import Timeline from './components/Timeline'

function Advisories() {
  const source = ['all', 'nvd', 'ghsa', 'usn', 'pyadvisory', 'goadvisory']
  const severity = ['all', ...severityList]

  const [formattedDate, setFormattedDate] = useState(getDateFormat(new Date()))

  const [severityValue, setSeverityValue] = useState('')
  const [sourceValue, setSourceValue] = useState('')

  const [GetFeed, { data: feedData, loading }] = useLazyQuery(GetFeedLogs)

  useEffect(() => {
    if (feedData === undefined) {
      GetFeed({
        variables: {
          date: formattedDate,
          first: 10
        }
      })
    }
  }, [])

  const onPreviousPage = () => {
    GetFeed({
      variables: {
        date: formattedDate,
        first: undefined,
        last: 10,
        before: feedData.feedLogs.pageInfo.startCursor,
        after: '',
        severity: severityValue === 'all' ? '' : severityValue,
        source: sourceValue === 'all' ? '' : sourceValue
      }
    })
  }

  const onNextPage = () => {
    GetFeed({
      variables: {
        date: formattedDate,
        first: 10,
        last: undefined,
        after: feedData.feedLogs.pageInfo.endCursor,
        before: '',
        severity: severityValue === 'all' ? '' : severityValue,
        source: sourceValue === 'all' ? '' : sourceValue
      }
    })
  }

  return (
    <>
      <Timeline
        setFormattedDate={setFormattedDate}
        formattedDate={formattedDate}
        getFeed={GetFeed}
      />
      <Card mt={4} bg='white'>
        <CardHeader py={2}>
          <Flex direction='row' width={'100%'} gap={2}>
            <Input placeholder='Search' maxW='400px' />
            <Menu>
              <MenuButton
                as={Button}
                colorScheme='blue'
                fontWeight='normal'
                fontSize={'sm'}
                leftIcon={<FaFilter size={14} />}
              >
                Source
              </MenuButton>
              <MenuList fontWeight='none' fontSize='sm'>
                <MenuOptionGroup>
                  {source.map((p) => (
                    <MenuItemOption
                      value={p}
                      key={p}
                      onClick={() => {
                        setSourceValue(p)
                        GetFeed({
                          variables: {
                            date: formattedDate,
                            source: p === 'all' ? '' : p,
                            first: 10
                          }
                        })
                      }}
                      textTransform={'uppercase'}
                    >
                      {p}
                    </MenuItemOption>
                  ))}
                </MenuOptionGroup>
              </MenuList>
            </Menu>
            <Menu>
              <MenuButton
                as={Button}
                colorScheme='blue'
                fontWeight='normal'
                fontSize={'sm'}
                leftIcon={<FaFilter size={14} />}
              >
                Severity
              </MenuButton>
              <MenuList fontWeight='none' fontSize='sm'>
                <MenuOptionGroup>
                  {severity.map((p) => (
                    <MenuItemOption
                      value={p}
                      key={p}
                      onClick={() => {
                        setSeverityValue(p)
                        GetFeed({
                          variables: {
                            date: formattedDate,
                            severity: p === 'all' ? '' : p,
                            first: 10
                          }
                        })
                      }}
                      textTransform={'capitalize'}
                    >
                      {p}
                    </MenuItemOption>
                  ))}
                </MenuOptionGroup>
              </MenuList>
            </Menu>
            <Spacer></Spacer>
            <Flex gap={2} direction={'row'}>
              <Box as={Flex} direction={'row'} gap={2}>
                <Tooltip label='Dowload'>
                  <IconButton
                    colorScheme='blue'
                    size='md'
                    icon={<FaDownload />}
                  ></IconButton>
                </Tooltip>
                <Tooltip label='Send to Slack'>
                  <IconButton
                    colorScheme='blue'
                    size='md'
                    icon={<FaSlack />}
                  ></IconButton>
                </Tooltip>
                <Tooltip label='Refresh'>
                  <IconButton
                    colorScheme='blue'
                    size='md'
                    icon={<RepeatIcon />}
                  ></IconButton>
                </Tooltip>
              </Box>
            </Flex>
          </Flex>
        </CardHeader>
        {feedData && (
          <AdvisoryLog
            title={'Feed'}
            captions={[
              'ID',
              'Description',
              'Published at',
              'Updated at',
              'Severity',
              'Affected',
              'Aliases'
            ]}
            data={feedData.feedLogs}
            loading={loading}
            onPreviousPage={onPreviousPage}
            onNextPage={onNextPage}
          />
        )}
      </Card>
    </>
  )
}

export default Advisories
