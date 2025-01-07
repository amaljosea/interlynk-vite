import { useMutation } from '@apollo/client'
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
  Text,
  Tooltip
} from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { recheckHealth } from 'graphQL/Mutation'

import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

const sbomCategory = ['Timestamp', 'Supplier Name', 'Unique ID', 'Author']

const ComplianceChecks = (props) => {
  const {
    name,
    isOpen,
    onClose,
    ntia,
    fda,
    ntiaLoading,
    fdaLoading,
    activeTab
  } = props
  const params = useParams()
  const { showToast } = useCustomToast()
  const { secondaryBgColor, lightBlueBg, primaryBlueText, sameSecondaryText } =
    useThemeColor([
      'secondaryBgColor',
      'lightBlueBg',
      'primaryBlueText',
      'sameSecondaryText'
    ])

  const { organization } = useGlobalState()
  const { activeCompliances } = organization || ''
  const tabs = activeCompliances
    ?.filter((item) => item?.complianceType !== 'unspecified')
    ?.map((item) => item?.complianceType)

  const [tab, setTab] = useState(activeTab || 0)
  const onTabChange = (value) => setTab(value)

  const [healthRecheck] = useMutation(recheckHealth)

  const getBgColor = (score) => {
    if (score === 0) {
      return 'red'
    } else if (score === 100) {
      return 'green'
    } else {
      return 'orange'
    }
  }

  const onCheck = (title) => {
    const result = complianceData?.find((item) => item?.title === title)
    return result?.desc
  }

  const ComplianceReport = ({ key, item }) => {
    const { primaryBlueText, primarySuccessColor, primaryErrorColor } =
      useThemeColor([
        'primaryBlueText',
        'primarySuccessColor',
        'primaryErrorColor'
      ])
    return (
      <Flex
        gap={6}
        key={key}
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Stack direction={'row'}>
          <Text fontSize={'xs'} textTransform={'capitalize'}>
            {item?.category?.replace('Component ', '')}
          </Text>
          <Tooltip label={onCheck(item?.category)}>
            <InfoIcon fontSize={'sm'} color={primaryBlueText} />
          </Tooltip>
        </Stack>
        <Box fontSize={'xs'} ml={'auto'}>
          {sbomCategory?.includes(item?.category) ? (
            <>
              {item?.score === 100 ? (
                <FaCheckCircle color={primarySuccessColor} size={22} />
              ) : (
                <FaTimesCircle color={primaryErrorColor} size={22} />
              )}
            </>
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

  const handleSave = () => {
    showToast({
      description: 'Checks rescan is in progress',
      status: 'info'
    })
    healthRecheck({
      variables: {
        sbomId: params?.sbomid
      }
    }).then((res) => {
      if (res?.data) {
        showToast({
          description: 'Health re-check successfully',
          status: 'success'
        })
      }
    })
  }

  const RunAlert = () => {
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
          onClick={handleSave}
          fontWeight={'medium'}
        >
          Run Checks
        </Text>
      </Flex>
    )
  }

  const ScoreBoard = ({ data, loading }) => {
    const sbomData = data?.scoreByCategory?.filter(
      (item) => !item?.category?.startsWith('Component')
    )
    const compData = data?.scoreByCategory?.filter((item) =>
      item?.category?.startsWith('Component')
    )

    if (loading) return <CustomLoader />

    return (
      <Flex flexDir={'column'} alignItems={'flex-start'} gap={3}>
        <Flex
          gap={3}
          width={'100%'}
          flexDir={'column'}
          hidden={data?.score === 0}
        >
          <Text fontSize={'sm'} fontWeight={'medium'}>
            General Details
          </Text>
          {sbomData ? (
            sbomData?.map((item, index) => (
              <ComplianceReport key={index} item={item} />
            ))
          ) : (
            <Text color={sameSecondaryText}>No record to display</Text>
          )}
          <Text mt={3} fontSize={'sm'} fontWeight={'medium'}>
            Component Details
          </Text>
          {compData ? (
            compData?.map((item, index) => (
              <ComplianceReport key={index} item={item} />
            ))
          ) : (
            <Text color={sameSecondaryText}>No record to display</Text>
          )}
          <Divider mt={1} hidden={!data} />
        </Flex>
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
              {data?.score === 0 ? 'N/A' : `${Math.round(data?.score)} %`}
            </TagLabel>
          </Tag>
        </Flex>
        {data?.score === 0 && <RunAlert />}
      </Flex>
    )
  }

  const getLoading = (type) => {
    switch (type) {
      case 'fda':
        return fdaLoading
      case 'ntia':
        return ntiaLoading
    }
  }

  const getData = (type) => {
    switch (type) {
      case 'fda':
        return fda
      case 'ntia':
        return ntia
    }
  }

  return (
    <Drawer size='md' isOpen={isOpen} placement='right' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={2} />
        <DrawerHeader pl={4}>
          <Text fontWeight={'medium'}>Compliance Checks</Text>
          <Tag
            mt={1}
            hidden={!name}
            fontSize={'xs'}
            w={'fit-content'}
            colorScheme='blue'
            textAlign={'right'}
            wordBreak={'break-all'}
          >
            {name}
          </Tag>
        </DrawerHeader>
        <Divider />
        <DrawerBody p={0}>
          <Tabs index={tab} onChange={onTabChange}>
            <TabList
              position={'fixed'}
              bg={secondaryBgColor}
              zIndex={1}
              left={0}
              right={0}
            >
              {tabs.map((item, index) => (
                <Tab
                  py={3.5}
                  key={index}
                  fontSize={'sm'}
                  textTransform={'uppercase'}
                  _focus={{ outline: 'none', bg: 'none' }}
                >
                  {item}
                </Tab>
              ))}
            </TabList>
            <TabPanels pos={'relative'} top={14} overflowX={'hidden'}>
              {tabs?.map((item, index) => (
                <TabPanel key={index}>
                  {item === 'bsi' ? (
                    <Center py={24} color={sameSecondaryText}>
                      Coming Soon...
                    </Center>
                  ) : (
                    <ScoreBoard
                      loading={getLoading(item)}
                      data={getData(item)}
                    />
                  )}
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default ComplianceChecks
