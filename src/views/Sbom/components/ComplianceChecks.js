import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { complianceData } from 'variables/general'

import { InfoIcon } from '@chakra-ui/icons'
import {
  Box,
  Center,
  Divider,
  Flex,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  TagLabel,
  Text,
  Tooltip
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import LynkDrawer from 'components/LynkDrawer'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import { recheckHealth } from 'graphQL/Mutation'
import { ActiveCompliances } from 'graphQL/Queries'

import { LuCircleCheck, LuCircleX } from 'react-icons/lu'

const SBOM_CATEGORIES = ['Timestamp', 'Supplier Name', 'Unique ID', 'Author']

const getBgColor = (score) => {
  if (score === 0) return 'red'
  if (score === 100) return 'green'
  return 'orange'
}

const getComplianceDescription = (title) => {
  return complianceData.find((item) => item?.title === title)?.desc
}

const ComplianceReport = ({ item }) => {
  const { primaryBlueText, primarySuccessColor, primaryErrorColor } =
    useThemeColor([
      'primaryBlueText',
      'primarySuccessColor',
      'primaryErrorColor'
    ])

  return (
    <Flex
      gap={6}
      width={'100%'}
      alignItems={'center'}
      justifyContent={'space-between'}
    >
      <Stack direction={'row'}>
        <Text fontSize={'xs'} textTransform={'capitalize'}>
          {item?.category?.replace('Component ', '')}
        </Text>
        <Tooltip label={getComplianceDescription(item?.category)}>
          <InfoIcon fontSize={'sm'} color={primaryBlueText} />
        </Tooltip>
      </Stack>
      <Box fontSize={'xs'} ml={'auto'}>
        {SBOM_CATEGORIES.includes(item?.category) ? (
          item?.score === 100 ? (
            <LuCircleCheck color={primarySuccessColor} size={22} />
          ) : (
            <LuCircleX color={primaryErrorColor} size={22} />
          )
        ) : (
          <Tag
            w={'60px'}
            variant='subtle'
            title='Compliance score'
            colorScheme={getBgColor(item?.score)}
          >
            <TagLabel ml={'auto'} fontSize={'sm'}>
              {Math.round(item?.score)} %
            </TagLabel>
          </Tag>
        )}
      </Box>
    </Flex>
  )
}

const RunAlert = ({ onRun }) => {
  const { lightBlueBg, primaryBlueText } = useThemeColor([
    'lightBlueBg',
    'primaryBlueText'
  ])

  return (
    <Flex
      p={3}
      mt={2}
      gap={3}
      bg={lightBlueBg}
      width={'100%'}
      borderRadius={5}
      alignItems={'center'}
      justifyContent={'space-between'}
    >
      <Flex gap={2} alignItems={'center'}>
        <InfoIcon color={primaryBlueText} />
        <Text fontSize={'sm'}>Run checks to see compliance scores</Text>
      </Flex>
      <Text
        fontSize={'sm'}
        color={primaryBlueText}
        cursor={'pointer'}
        onClick={onRun}
        fontWeight={'medium'}
      >
        Run Checks
      </Text>
    </Flex>
  )
}

const ScoreBoard = ({ data, loading, onRun }) => {
  const { sameSecondaryText } = useThemeColor(['sameSecondaryText'])

  const generalData = data?.scoreByCategory?.filter(
    (item) => !item?.category?.startsWith('Component')
  )
  const componentData = data?.scoreByCategory?.filter((item) =>
    item?.category?.startsWith('Component')
  )

  if (loading) return <CustomLoader />

  return (
    <Flex flexDir={'column'} alignItems={'flex-start'} gap={3}>
      {data?.score !== 0 && (
        <>
          <Text fontSize={'sm'} fontWeight={'medium'}>
            General Details
          </Text>
          {generalData?.length ? (
            generalData.map((item, index) => (
              <ComplianceReport key={index} item={item} />
            ))
          ) : (
            <Text color={sameSecondaryText}>No record to display</Text>
          )}
          <Text mt={3} fontSize={'sm'} fontWeight={'medium'}>
            Component Details
          </Text>
          {componentData?.length ? (
            componentData.map((item, index) => (
              <ComplianceReport key={index} item={item} />
            ))
          ) : (
            <Text color={sameSecondaryText}>No record to display</Text>
          )}
          <Divider mt={1} hidden={!data} />
        </>
      )}
      <Flex
        mt={1}
        hidden={!data}
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Text fontSize={'sm'} fontWeight={'medium'}>
          Score
        </Text>
        <Tag w={'60px'} title='Compliance score'>
          <TagLabel ml={'auto'}>
            {data?.score === 0 ? 'N/A' : `${Math.round(data?.score)}%`}
          </TagLabel>
        </Tag>
      </Flex>
      {data?.score === 0 && <RunAlert onRun={onRun} />}
    </Flex>
  )
}

const ComplianceChecks = ({
  name,
  isOpen,
  onClose,
  ntia,
  fda,
  ntiaLoading,
  fdaLoading,
  activeTab = 0
}) => {
  const { sbomid } = useParams()
  const { showToast } = useCustomToast()
  const { secondaryBgColor, sameSecondaryText } = useThemeColor([
    'secondaryBgColor',
    'sameSecondaryText'
  ])

  const [tabIndex, setTabIndex] = useState(activeTab)

  const { data: compliance, loading: complianceLoading } =
    useQuery(ActiveCompliances)
  const [healthRecheck] = useMutation(recheckHealth)

  const activeCompliances = compliance?.organization?.activeCompliances || []
  const tabs = activeCompliances
    .filter((item) => item?.complianceType !== 'unspecified')
    .map((item) => item?.complianceType)

  const handleRecheck = () => {
    showToast({ description: 'Checks rescan is in progress', status: 'info' })
    healthRecheck({ variables: { sbomId: sbomid } }).then((res) => {
      if (res?.data) {
        showToast({
          description: 'Health re-check successfully',
          status: 'success'
        })
      }
    })
  }

  const getLoadingState = (type) => (type === 'fda' ? fdaLoading : ntiaLoading)
  const getComplianceData = (type) => (type === 'fda' ? fda : ntia)

  return (
    <LynkDrawer
      title={'Compliance Checks'}
      subtitle={
        <Tag
          hidden={!name}
          fontSize={'xs'}
          w={'fit-content'}
          colorScheme='blue'
          textAlign={'right'}
          wordBreak={'break-all'}
        >
          {name}
        </Tag>
      }
      isOpen={isOpen}
      onClose={onClose}
      noFooter
    >
      {complianceLoading ? (
        <CustomLoader />
      ) : (
        <Tabs index={tabIndex} onChange={setTabIndex}>
          <TabList
            position={'fixed'}
            bg={secondaryBgColor}
            zIndex={1}
            left={0}
            right={0}
            top={!name ? '60px' : '90px'}
          >
            {tabs.map((tab, index) => (
              <Tab
                py={3.5}
                key={index}
                fontSize={'sm'}
                textTransform={'uppercase'}
                _focus={{ outline: 'none', bg: 'none' }}
              >
                {tab}
              </Tab>
            ))}
          </TabList>
          <TabPanels pos={'relative'} top={14} overflowX={'hidden'}>
            {tabs.map((tab, index) => (
              <TabPanel key={index} p={0}>
                {tab === 'bsi' ? (
                  <Center py={24} color={sameSecondaryText}>
                    Coming Soon...
                  </Center>
                ) : (
                  <ScoreBoard
                    data={getComplianceData(tab)}
                    loading={getLoadingState(tab)}
                    onRun={handleRecheck}
                  />
                )}
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      )}
    </LynkDrawer>
  )
}

export default ComplianceChecks
