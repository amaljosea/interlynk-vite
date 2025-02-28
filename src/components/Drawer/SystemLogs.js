import { useQuery } from '@apollo/client'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  calculateDuration,
  formatString,
  getFullDateTime,
  timeSince
} from 'utils'

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel
} from '@chakra-ui/react'
import {
  Flex,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  Tooltip
} from '@chakra-ui/react'
import { List, ListIcon, ListItem } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import LynkDrawer from 'components/LynkDrawer'

import { useThemeColor } from 'hooks/useThemeColors'

import { GetActivities } from 'graphQL/Queries'

import { FaRegCalendar, FaRegClock } from 'react-icons/fa6'
import { MdCheckCircle, MdSettings } from 'react-icons/md'

const runType = {
  vuln_scan: 'Vulnerability Scan',
  comp_vuln_scan: 'Component Vulnerability Scan',
  automation_scan: 'Automation Run',
  checks_scan: 'Checks Run',
  labelling_scan: 'Internal Labeling'
}

function getTimeDifference(startTime) {
  const now = new Date()
  const start = new Date(startTime)
  let diffMs = now - start
  diffMs = Math.abs(diffMs)

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60)
  const seconds = Math.floor((diffMs / 1000) % 60)

  const timeParts = [
    days > 0 && `${days}d`,
    hours > 0 && `${hours}h`,
    minutes > 0 && `${minutes}m`,
    seconds > 0 && `${seconds}s`
  ]?.filter(Boolean)

  return `${timeParts.join(' ')}`
}

const SystemLogs = ({ isOpen, onClose }) => {
  const params = useParams()
  const { sameSecondaryText } = useThemeColor(['sameSecondaryText'])

  const { data, loading, startPolling, stopPolling } = useQuery(GetActivities, {
    skip: isOpen ? false : true,
    variables: { projectId: params?.productid, sbomId: params?.sbomid }
  })
  const { sbomActivities } = data?.sbom || {}

  const shouldPoll = sbomActivities?.some((item) => item?.endTime === null)

  useEffect(() => {
    if (!loading && shouldPoll) {
      startPolling(5000)
    } else {
      stopPolling()
    }
  }, [loading, shouldPoll, startPolling, stopPolling])

  const filterData =
    sbomActivities?.length > 0
      ? [...sbomActivities]?.sort((a, b) => {
          const dateA = new Date(a?.startTime)
          const dateB = new Date(b?.startTime)
          return dateB - dateA
        })
      : []

  return (
    <LynkDrawer
      title={'System Log'}
      size='lg'
      isOpen={isOpen}
      placement='right'
      onClose={onClose}
      noFooter
    >
      {loading ? (
        <CustomLoader />
      ) : (
        <Accordion m={0} px={2} allowToggle>
          {filterData?.map((row, index) => (
            <AccordionItem
              key={index}
              borderTop={index === 0 ? 0 : '-moz-initial'}
            >
              <AccordionButton px={1} py={2} w={'100%'}>
                <SimpleGrid
                  gap={4}
                  columns={2}
                  w={'100%'}
                  justifyContent={'space-between'}
                >
                  {/* LEFT */}
                  <LogInfo row={row} />
                  {/* RIGHT */}
                  <LogDuration row={row} />
                </SimpleGrid>

                <AccordionIcon color={sameSecondaryText} />
              </AccordionButton>
              <AccordionPanel px={1} pb={4}>
                <ExpandedComponent data={row} />
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </LynkDrawer>
  )
}

const ExpandedComponent = ({ data }) => {
  const { headingTextColor, sameSecondaryText } = useThemeColor([
    'headingTextColor',
    'sameSecondaryText'
  ])

  const setAction = (type, subject) => {
    switch (type) {
      case 'cpe':
        return `CPE: ${subject?.cpes || 'N/A'}`
      case 'purl':
        return `PURL: ${subject?.purl || 'N/A'}`
    }
  }

  const { sbomActivityDetails } = data || {}

  return (
    <List spacing={2} fontSize={'xs'} color={headingTextColor}>
      <ListItem>
        <ListIcon as={MdSettings} color={sameSecondaryText} />
        Started at {data?.startTime ? getFullDateTime(data?.startTime) : ''}
      </ListItem>
      {sbomActivityDetails?.map((item, index) => (
        <ListItem key={index}>
          <ListIcon as={MdSettings} color={sameSecondaryText} />
          {`[${item?.subject?.name}:${item?.subject?.version}]`} {'>'}{' '}
          {setAction(item?.action, item?.subject)} {'>'} {item?.result}
        </ListItem>
      ))}
      <ListItem hidden={!data?.endTime}>
        <ListIcon as={MdSettings} color={sameSecondaryText} />
        Ended at {data?.endTime ? getFullDateTime(data?.endTime) : ''}
      </ListItem>
    </List>
  )
}

const LogInfo = ({ row }) => {
  const { headingTextColor, primarySuccessColor, sameSecondaryText } =
    useThemeColor([
      'headingTextColor',
      'primarySuccessColor',
      'sameSecondaryText'
    ])

  return (
    <Flex gap={2} alignItems={'flex-start'} my={3}>
      {row?.endTime ? (
        <MdCheckCircle fontSize={20} color={primarySuccessColor} />
      ) : (
        <Spinner size='sm' mt={1} />
      )}
      <Stack spacing={1} alignItems={'flex-start'}>
        <Text fontSize={14} textAlign={'left'} color={headingTextColor}>
          {runType[row?.runType] || formatString(row?.runType)}
        </Text>
        <Text
          fontSize={'xs'}
          wordBreak={'break-all'}
          color={sameSecondaryText}
          textTransform={'capitalize'}
        >
          {row?.invocation} • Run by {row?.user?.name || 'System'}
        </Text>
      </Stack>
    </Flex>
  )
}

const LogDuration = ({ row }) => {
  const { startTime, endTime } = row || {}
  const { hours, minutes, seconds } = calculateDuration(startTime, endTime)
  const timeDiff = row?.startTime && getTimeDifference(row?.startTime)

  const { sameSecondaryText } = useThemeColor(['sameSecondaryText'])

  return (
    <Stack spacing={1.5} my={3}>
      <Flex gap={2} alignItems={'center'}>
        <FaRegCalendar fontSize={14} color={sameSecondaryText} />
        <Tooltip label={getFullDateTime(row?.endTime)}>
          <Text fontSize={'xs'} color={sameSecondaryText}>
            {row?.endTime ? timeSince(row?.endTime) : 'Now'}
          </Text>
        </Tooltip>
      </Flex>
      <Flex gap={2} alignItems={'center'}>
        <FaRegClock fontSize={14} color={sameSecondaryText} />
        {row?.endTime ? (
          <Text fontSize={'xs'} color={sameSecondaryText}>
            {hours > 0 && `${hours} hour${hours > 1 ? 's' : ''} `}
            {minutes > 0 && `${minutes} minute${minutes > 1 ? 's' : ''} `}
            {seconds} second{seconds !== 1 ? 's' : ''}
          </Text>
        ) : (
          <Text fontSize={'xs'} color={sameSecondaryText}>
            Running for {timeDiff || ''}
          </Text>
        )}
      </Flex>
    </Stack>
  )
}

export default SystemLogs
