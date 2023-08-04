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
import React, { useContext, useState, useEffect } from 'react'
import { ChevronDownIcon, RepeatIcon } from '@chakra-ui/icons'
import GlobalContext from 'context/GlobalContext'
import Timeline from './components/Timeline'

import { FaDownload, FaSlack } from 'react-icons/fa'
import AdvisoryLog from './components/AdvisoryLog'
import { useQuery } from '@apollo/client'
import { GetFeedLogs } from 'graphQL/Queries'

function Advisories() {
  const { advisoriesData } = useContext(GlobalContext)

  const dates = advisoriesData.map((item) => ({ date: item.updated }))

  const [filterData, setFilterData] = useState([])
  const uniqProjects = ['All', 'NVD', 'GHSA', 'USN', 'PyAdvisory', 'GoAdvisory']
  // advisoryData.map((project) => {
  //   if (uniqProjects.indexOf(project.product) === -1) {
  //     uniqProjects.push(project.product)
  //   }
  // })

  const uniqVersions = []
  advisoriesData.map((project) => {
    if (uniqVersions.indexOf(project.version) === -1) {
      uniqVersions.push(project.version)
    }
  })
  const uniqUsers = [
    'All',
    'Peter.Gregory@svc.ai',
    'Ritesh.Noronha@interlynk.io',
    'NVD-Monitor',
    'Galvin.Belson@hooli.ai'
  ]

  const filterByProduct = (product) => {
    const filterList =
      product !== 'All'
        ? advisoriesData.filter((item) => item.source == product)
        : advisoriesData
    setFilterData(filterList)
  }

  const filterByType = (type) => {
    const filterList =
      type !== 'All'
        ? advisoriesData.filter((item) => item.severity == type)
        : advisoriesData
    setFilterData(filterList)
  }

  const filterBySource = (source) => {
    const filterList =
      source !== 'All'
        ? advisoriesData.filter((item) => item.source == source)
        : advisoriesData
    setFilterData(filterList)
  }

  const filterByUser = (user) => {
    const filterList =
      user !== 'All'
        ? advisoriesData.filter((item) => item.user == user)
        : advisoriesData
    setFilterData(filterList)
  }

  const [formattedDate, setFormattedDate] = useState('')

  useEffect(() => {
    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const day = String(currentDate.getDate()).padStart(2, '0')

    const formatted = `${year}-${month}-${day}`
    setFormattedDate(formatted)
  }, [])

  const { data } = useQuery(GetFeedLogs, {
    variables: {
      date: '2023-08-01'
    }
  })

  useEffect(() => {
    if (data) {
      console.log(`feedLogs`, data.feedLogs)
    }
  }, [data])

  return (
    <Flex direction='column' pt={{ base: '120px', md: '75px' }}>
      <Timeline events={dates} />
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
              {uniqProjects.map((p) => (
                <MenuItemOption
                  value={p}
                  key={p}
                  onClick={() => filterByProduct(p)}
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
              <MenuItemOption value='All' onClick={() => filterByType('All')}>
                All
              </MenuItemOption>
              <MenuItemOption
                value='Critical'
                onClick={() => filterByType('Critical')}
              >
                Critical
              </MenuItemOption>
              <MenuItemOption value='High' onClick={() => filterByType('High')}>
                High
              </MenuItemOption>
              <MenuItemOption
                value='Medium'
                onClick={() => filterByType('Medium')}
              >
                Medium
              </MenuItemOption>
              <MenuItemOption value='Low' onClick={() => filterByType('Low')}>
                Low
              </MenuItemOption>
              <MenuItemOption
                value='Unknown'
                onClick={() => filterByType('Unknown')}
              >
                Unknown
              </MenuItemOption>
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
      <AdvisoryLog
        title={'Feed'}
        captions={[
          'ID',
          'Description',
          'Updated at',
          'Severity',
          'Affected',
          'Aliases'
        ]}
        filterData={filterData}
        data={advisoriesData}
      />
    </Flex>
  )
}

export default Advisories
