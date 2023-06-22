// Chakra imports
import {
  Flex,
  Menu,
  MenuList,
  MenuItem,
  MenuButton,
  MenuOptionGroup,
  MenuItemOption,
  Button,
  Input,
  Spacer
} from '@chakra-ui/react'
import React, { useContext, useState } from 'react'
import ActivityLog from './components/ActivityLog'
import { ChevronDownIcon } from '@chakra-ui/icons'
import GlobalContext from 'context/GlobalContext'

function Activities() {
  const { activitiesData, setActivitiesData } = useContext(GlobalContext)
  const [filterData, setFilterData] = useState([])
  const uniqProjects = [
    'all',
    'sbomasm',
    'sbomex',
    'sbomst',
    'sbombenchmark.dev',
    'sbomqs'
  ]
  // activitiesData.map((project) => {
  //   if (uniqProjects.indexOf(project.product) === -1) {
  //     uniqProjects.push(project.product)
  //   }
  // })

  const uniqVersions = []
  activitiesData.map((project) => {
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
  // activitiesData.map((project) => {
  //   if (uniqUsers.indexOf(project.user) === -1) {
  //     uniqUsers.push(project.user)
  //   }
  // })

  const filterByProduct = (product) => {
    const filterList =
      product !== 'all'
        ? activitiesData.filter((item) => item.product == product)
        : activitiesData
    setFilterData(filterList)
  }

  const filterByType = (type) => {
    const filterList =
      type !== 'All'
        ? activitiesData.filter((item) => item.type == type)
        : activitiesData
    setFilterData(filterList)
  }

  const filterBySource = (source) => {
    const filterList =
      source !== 'All'
        ? activitiesData.filter((item) => item.source == source)
        : activitiesData
    setFilterData(filterList)
  }

  const filterByUser = (user) => {
    const filterList =
      user !== 'All'
        ? activitiesData.filter((item) => item.user == user)
        : activitiesData
    setFilterData(filterList)
  }

  return (
    <Flex direction='column' pt={{ base: '120px', md: '75px' }}>
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
            Product
          </MenuButton>
          <MenuList fontWeight='none' fontSize='sm'>
            <MenuOptionGroup title='Products'>
              {uniqProjects.map((p) => (
                <MenuItemOption value={p} onClick={() => filterByProduct(p)}>
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
            Type
          </MenuButton>
          <MenuList fontWeight='none' fontSize='sm'>
            <MenuOptionGroup title='Version'>
              <MenuItemOption value='All' onClick={() => filterByType('All')}>
                All
              </MenuItemOption>
              <MenuItemOption
                value='SBOM Viewed'
                onClick={() => filterByType('SBOM Viewed')}
              >
                SBOM Viewed
              </MenuItemOption>
              <MenuItemOption
                value='SBOM Shared'
                onClick={() => filterByType('SBOM Shared')}
              >
                SBOM Shared
              </MenuItemOption>
              <MenuItemOption
                value='SBOM Approved'
                onClick={() => filterByType('SBOM Approved')}
              >
                SBOM Approved
              </MenuItemOption>
              <MenuItemOption
                value='SBOM Built'
                onClick={() => filterByType('SBOM Built')}
              >
                SBOM Built
              </MenuItemOption>
              <MenuItemOption
                value='SBOM Assembled'
                onClick={() => filterByType('SBOM Assembled')}
              >
                SBOM Assembled
              </MenuItemOption>
              <MenuItemOption
                value='New Vulnerability'
                onClick={() => filterByType('New Vulnerability')}
              >
                New Vulnerability
              </MenuItemOption>
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
            Source
          </MenuButton>
          <MenuList fontWeight='none' fontSize='sm'>
            <MenuOptionGroup title='Version'>
              <MenuItemOption value='All' onClick={() => filterBySource('All')}>
                All
              </MenuItemOption>
              <MenuItemOption
                value='GitHub'
                onClick={() => filterBySource('GitHub')}
              >
                GitHub
              </MenuItemOption>
              <MenuItemOption
                value='SBOM'
                onClick={() => filterBySource('SBOM')}
              >
                SBOM
              </MenuItemOption>
              <MenuItemOption
                value='Assembled'
                onClick={() => filterBySource('Assembled')}
              >
                Assembled
              </MenuItemOption>
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
            User
          </MenuButton>
          <MenuList fontWeight='none' fontSize='sm'>
            <MenuOptionGroup title='Users'>
              {uniqUsers.map((v) => (
                <MenuItemOption value={v} onClick={() => filterByUser(v)}>
                  {v}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
        <Input placeholder='Search' maxW='300px' />
      </Flex>
      <ActivityLog
        title={'Activities'}
        captions={['Type', 'Product', 'Version', 'User', 'Notes', 'Timestamp']}
        filterData={filterData}
        data={activitiesData}
      />
    </Flex>
  )
}

export default Activities
