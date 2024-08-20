import { useState } from 'react'
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
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react'

import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

const ComplianceChecks = ({
  name,
  isOpen,
  onClose,
  ntia,
  fda,
  ntiaLoading,
  fdaLoading
}) => {
  const bgColor = useColorModeValue('white', 'gray.700')
  const tabs = ['NTIA', 'FDA 510(K)', 'BSI TR-03183']
  const [tab, setTab] = useState(0)
  const onTabChange = (value) => setTab(value)

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
    const result = complianceData.find((item) => item?.title === title)
    return result?.desc
  }

  const ComplianceReport = ({ key, item, loading }) => {
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
            <InfoIcon fontSize={'sm'} color={'blue.500'} />
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
              width={'80px'}
              isLoading={loading}
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

  const ScoreBoard = ({ data, loading }) => {
    const sbomData = data?.scoreByCategory?.filter(
      (item) => !item?.category?.startsWith('Component')
    )
    const compData = data?.scoreByCategory?.filter((item) =>
      item?.category?.startsWith('Component')
    )

    return (
      <Flex flexDir={'column'} alignItems={'flex-start'} gap={3}>
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
        <Flex
          mt={1}
          width={'100%'}
          alignItems={'center'}
          justifyContent={'space-between'}
        >
          <Text fontSize={'sm'} fontWeight={'medium'}>
            Score
          </Text>
          <Button size='xs'>{Math.round(data?.score)} %</Button>
        </Flex>
      </Flex>
    )
  }

  return (
    <Drawer size='sm' isOpen={isOpen} placement='right' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={2} />
        <DrawerHeader pl={4}>
          <Text mb={1} fontWeight={'medium'}>
            Compliance Checks
          </Text>
          <Tag
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
              bg={bgColor}
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
