// Chakra imports
import {
  Flex,
  Menu,
  MenuList,
  Tooltip,
  MenuButton,
  MenuOptionGroup,
  MenuItemOption,
  Button,
  Input,
  Box,
  IconButton,
  Spacer
} from '@chakra-ui/react'
import React, { useState, useEffect } from 'react'
import { ChevronDownIcon, RepeatIcon } from '@chakra-ui/icons'
import Timeline from './components/Timeline'

import { FaDownload, FaSlack } from 'react-icons/fa'
import AdvisoryLog from './components/AdvisoryLog'
import { useLazyQuery, useQuery } from '@apollo/client'
import { GetFeedLogs } from 'graphQL/Queries'
import { getDateFormat } from 'utils'

function Advisories() {
  const source = ['all', 'nvd', 'ghsa', 'usn', 'pyadvisory', 'goadvisory']
  const severity = ['all', 'critical', 'high', 'low', 'medium', 'unknown']

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

  // useEffect(() => {
  //   if (feedData) {
  //     console.log(`feedLogs`, feedData.feedLogs)
  //   }
  // }, [feedData])

  return (
    <Flex direction='column' pt={{ base: '120px', md: '75px' }}>
      <Timeline
        setFormattedDate={setFormattedDate}
        formattedDate={formattedDate}
        getFeed={GetFeed}
      />
      <Flex direction='row' pt={{ base: '120px', md: '0px' }}>
        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDownIcon />}
            maxW='150px'
            px={4}
            py={2}
            me={2}
            transition='all 0.2s'
            borderRadius='md'
            borderWidth='1px'
            fontSize='sm'
            fontWeight='none'
          >
            Source
          </MenuButton>
          <MenuList fontWeight='none' fontSize='sm'>
            <MenuOptionGroup title='Products'>
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
            rightIcon={<ChevronDownIcon />}
            maxW='150px'
            px={4}
            py={2}
            me={2}
            transition='all 0.2s'
            borderRadius='md'
            borderWidth='1px'
            fontSize='sm'
            fontWeight='none'
          >
            Severity
          </MenuButton>
          <MenuList fontWeight='none' fontSize='sm'>
            <MenuOptionGroup title='Version'>
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
        <Input placeholder='Search' maxW='300px' />
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
    </Flex>
  )
}

export default Advisories
