import { gql, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { calculateDuration, getFullDateTime } from 'utils'
import { formatString, timeSince } from 'utils'

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel
} from '@chakra-ui/react'
import { Flex, SimpleGrid, Stack, Text, Tooltip } from '@chakra-ui/react'
import { List, ListIcon, ListItem } from '@chakra-ui/react'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'

import { useThemeColor } from 'hooks/useThemeColors'

import { FaRegCalendar, FaRegClock } from 'react-icons/fa6'
import { MdCheckCircle, MdSettings } from 'react-icons/md'

const GetActivities = gql`
  query GetActivities($projectId: Uuid!, $sbomId: Uuid!) {
    sbom(projectId: $projectId, sbomId: $sbomId) {
      id
      sbomActivities {
        id
        sbom {
          id
        }
        runId
        runType
        invocation
        user {
          id
          name
        }
        startTime
        endTime
        sbomActivityDetails {
          subjectType
          subjectId
          subject {
            ... on Sbom {
              id
            }
            ... on SbomComponent {
              id
              name
              version
              purl
              cpes
            }
          }
          action
          result
        }
      }
    }
  }
`

const runType = {
  vuln_scan: 'Vulnerability Scan',
  comp_vuln_scan: 'Component Vulnerability Scan',
  automation_scan: 'Automation Run',
  checks_scan: 'Checks Run',
  labelling_scan: 'Internal Labeling'
}

const SystemLogs = ({ isOpen, onClose }) => {
  const params = useParams()
  const {
    headingTextColor,
    primarySuccessColor,
    sameSecondaryText,
    secondaryTextColor
  } = useThemeColor([
    'headingTextColor',
    'primarySuccessColor',
    'sameSecondaryText',
    secondaryTextColor
  ])

  const { data, loading } = useQuery(GetActivities, {
    skip: isOpen ? false : true,
    variables: { projectId: params?.productid, sbomId: params?.sbomid }
  })
  const { sbomActivities } = data?.sbom || {}

  const filterData =
    sbomActivities?.length > 0
      ? [...sbomActivities]?.sort((a, b) => {
          const dateA = new Date(a?.startTime)
          const dateB = new Date(b?.startTime)
          return dateB - dateA
        })
      : []

  const setAction = (type, subject) => {
    switch (type) {
      case 'cpe':
        return `CPE: ${subject?.cpes || 'N/A'}`
      case 'purl':
        return `PURL: ${subject?.purl || 'N/A'}`
    }
  }

  const ExpandedComponent = ({ data }) => {
    const { sbomActivityDetails } = data || {}
    return (
      <List spacing={2} fontSize={'xs'} color={headingTextColor}>
        <ListItem>
          <ListIcon as={MdSettings} color={sameSecondaryText} />
          Started at {data?.startTime ? getFullDateTime(data?.startTime) : ''}
        </ListItem>
        {sbomActivityDetails?.map((item) => (
          <ListItem key={item?.id}>
            <ListIcon as={MdSettings} color={sameSecondaryText} />
            {`[${item?.subject?.name}:${item?.subject?.version}]`} {'>'}{' '}
            {setAction(item?.action, item?.subject)} {'>'} {item?.result}
          </ListItem>
        ))}
        <ListItem>
          <ListIcon as={MdSettings} color={sameSecondaryText} />
          Ended at {data?.endTime ? getFullDateTime(data?.endTime) : ''}
        </ListItem>
      </List>
    )
  }

  const LogInfo = ({ row }) => {
    return (
      <Flex gap={2} alignItems={'flex-start'} my={3}>
        <MdCheckCircle fontSize={20} color={primarySuccessColor} />
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
    return (
      <Stack spacing={1.5} my={3}>
        <Flex gap={2} alignItems={'center'}>
          <FaRegCalendar fontSize={14} color={sameSecondaryText} />
          <Tooltip label={getFullDateTime(row?.endTime)}>
            <Text fontSize={'xs'} color={sameSecondaryText}>
              {row?.endTime ? timeSince(row?.endTime) : ''}
            </Text>
          </Tooltip>
        </Flex>
        <Flex gap={2} alignItems={'center'}>
          <FaRegClock fontSize={14} color={sameSecondaryText} />
          <Text fontSize={'xs'} color={sameSecondaryText}>
            {hours > 0 && `${hours} hour${hours > 1 ? 's' : ''} `}
            {minutes > 0 && `${minutes} minute${minutes > 1 ? 's' : ''} `}
            {seconds} second{seconds !== 1 ? 's' : ''}
          </Text>
        </Flex>
      </Stack>
    )
  }

  return (
    <Drawer size='lg' isOpen={isOpen} placement='right' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={3} />
        <DrawerHeader borderBottomWidth='1px'>
          <Text fontWeight={'medium'}>System Log</Text>
        </DrawerHeader>
        <DrawerBody>
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
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default SystemLogs
