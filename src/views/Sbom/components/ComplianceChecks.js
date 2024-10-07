import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { complianceData } from 'variables/general'

import { InfoIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Text,
  Tooltip
} from '@chakra-ui/react'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import { recheckHealth } from 'graphQL/Mutation'

import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

const ComplianceChecks = ({
  name,
  isOpen,
  onClose,
  ntia,
  fda,
  ntiaLoading,
  fdaLoading,
  activeTab
}) => {
  const params = useParams()
  const { showToast } = useCustomToast()
  const { secondaryBgColor, lightBlueBg, primaryBlueText } = useThemeColor([
    'secondaryBgColor',
    'lightBlueBg',
    'primaryBlueText'
  ])

  const tabs = ['NTIA', 'FDA', 'BSI']
  const [tab, setTab] = useState(activeTab || 0)
  const onTabChange = (value) => setTab(value)

  const [healthRecheck] = useMutation(recheckHealth)

  const sbomCategory = ['Timestamp', 'Supplier Name', 'Unique ID', 'Author']

  const getBgColor = (score) => {
    if (score === 0) {
      return '#FED7D7'
    } else if (score === 100) {
      return '#C6F6D5'
    } else {
      return '#FEEBC8'
    }
  }

  const onCheck = (title) => {
    const result = complianceData?.find((item) => item?.title === title)
    return result?.desc
  }

  const ComplianceReport = ({ key, item, loading }) => {
    const { primaryBlueText } = useThemeColor(['primaryBlueText'])
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
                <FaCheckCircle color='green' size={20} />
              ) : (
                <FaTimesCircle color='red' size={20} />
              )}
            </>
          ) : (
            <Button
              size='xs'
              color={'#000'}
              width={'60px'}
              isLoading={loading}
              cursor={'default'}
              bg={getBgColor(item?.score)}
              _hover={{ background: getBgColor(item?.score) }}
            >
              <span> {Math.round(item?.score)} %</span>
            </Button>
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
          color='blue.600'
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

    return (
      <Flex flexDir={'column'} alignItems={'flex-start'} gap={3}>
        <Flex
          gap={3}
          width={'100%'}
          flexDir={'column'}
          hidden={data?.score === 0}
        >
          <Text fontSize={'sm'} fontWeight={'medium'}>
            Details
          </Text>
          {sbomData?.map((item, index) => (
            <ComplianceReport key={index} item={item} loading={loading} />
          ))}
          <Text mt={3} fontSize={'sm'} fontWeight={'medium'}>
            Component Details
          </Text>
          {compData?.map((item, index) => (
            <ComplianceReport key={index} item={item} loading={loading} />
          ))}
          <Divider mt={1} />
        </Flex>
        <Flex
          mt={1}
          width={'100%'}
          alignItems={'center'}
          justifyContent={'space-between'}
        >
          <Text fontSize={'sm'} fontWeight={'medium'}>
            Score
          </Text>
          <Button size='xs' width={'60px'} cursor={'default'}>
            {data?.score === 0 ? 'N/A' : `${Math.round(data?.score)} %`}
          </Button>
        </Flex>
        {data?.score === 0 && <RunAlert />}
      </Flex>
    )
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
                  textTransform={'capitalize'}
                  _focus={{ outline: 'none', bg: 'none' }}
                >
                  {item}
                </Tab>
              ))}
            </TabList>
            <TabPanels pos={'relative'} top={14} overflowX={'hidden'}>
              <TabPanel>
                <ScoreBoard loading={ntiaLoading} data={ntia} />
              </TabPanel>
              <TabPanel>
                <ScoreBoard loading={fdaLoading} data={fda} />
              </TabPanel>
              <TabPanel>
                <Flex alignItems={'center'} justifyContent={'center'}>
                  <Text py={24} color={'gray.500'}>
                    Coming Soon...
                  </Text>
                </Flex>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default ComplianceChecks
