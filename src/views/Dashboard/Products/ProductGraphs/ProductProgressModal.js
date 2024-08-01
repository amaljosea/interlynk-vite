import { useState } from 'react'

import {
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  GridItem,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tag,
  Text,
  useColorModeValue
} from '@chakra-ui/react'

import { FaCalendar, FaFilter } from 'react-icons/fa'
import { FaChevronDown } from 'react-icons/fa6'
import { FaCode, FaDesktop, FaInbox } from 'react-icons/fa6'

import { defaultData } from './ProductProgressData'
import { developmentData } from './ProductProgressData'
import { productionData } from './ProductProgressData'
import Tree from './Tree'

const LegendItem = ({ color, label }) => (
  <Flex gap={2} alignItems={'center'}>
    <Box height={'1.75px'} width={'40px'} backgroundColor={color} />
    <Text fontSize={12} fontWeight={400} color={'#03030399'}>
      {label}
    </Text>
  </Flex>
)

const MenuHeading = ({ title, icon: Icon, onClick, active }) => {
  const grayBorder = useColorModeValue('#1A202C29', '#ffffff29')
  const grayText = useColorModeValue('#1A202C', '#60686f')
  const bgActive = useColorModeValue('#EDF2F7', '')
  const iconColor = '#3182CE'

  return (
    <MenuButton
      as={Button}
      fontWeight='normal'
      fontSize='sm'
      leftIcon={<Icon size={14} color={active ? iconColor : '#60686f'} />}
      onClick={onClick}
      variant='outline'
      borderColor={active ? iconColor : grayBorder}
      color={active ? iconColor : grayText}
      backgroundColor={active ? bgActive : 'transparent'}
    >
      {title}
    </MenuButton>
  )
}

const FilterMenu = ({ title, icon, value, onChange, options }) => {
  return (
    <Menu>
      <MenuHeading title={title} icon={icon} active={!!value} />
      <MenuList>
        <MenuOptionGroup value={value} onChange={onChange} type='radio'>
          {options.map((item, index) => (
            <MenuItemOption key={index} value={item} fontSize='sm'>
              {item}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  )
}

const ProductProgressModal = ({ isOpen, onClose }) => {
  const [targetComponent, setTargetComponent] = useState('')
  const [targetVulnerability, setTargetVulnerability] = useState('')
  const [env, setEnv] = useState('all')

  const bgColor = useColorModeValue('#EDF2F7', '#4D698166')
  const allComponents = [
    ...new Set([
      ...getComponentNames(defaultData),
      ...getComponentNames(developmentData),
      ...getComponentNames(productionData)
    ])
  ]

  const allVulnerabilities = [
    ...new Set([
      ...getVulnerabilityNames(defaultData),
      ...getVulnerabilityNames(developmentData),
      ...getVulnerabilityNames(productionData)
    ])
  ]

  const envIcon = (env) => {
    switch (env) {
      case 'default':
        return <FaInbox />
      case 'development':
        return <FaCode />
      case 'production':
        return <FaDesktop />
    }
  }

  const renderTree = (data, envName) => {
    if (env === 'all' || env === envName.toLowerCase()) {
      return (
        <GridItem border={'0.6px solid #1A202C29'} borderRadius={4} padding={3}>
          <Flex gap={2} alignItems={'center'}>
            <Flex
              h={'24px'}
              w={'24px'}
              color={'blue.500'}
              bg={bgColor}
              alignItems={'center'}
              justifyContent={'center'}
              borderRadius={4}
            >
              {envIcon(envName)}
            </Flex>
            <Text textTransform={'capitalize'} fontSize={14}>
              {envName}
            </Text>
          </Flex>
          <Box padding={1} mt={4}>
            <Tree
              data={data}
              targetComponent={targetComponent}
              targetVulnerability={targetVulnerability}
            />
          </Box>
        </GridItem>
      )
    }
    return null
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='6xl'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex align='center' gap={2}>
            <Text fontSize={20} fontWeight={500}>
              Product Progress
            </Text>
            <Tag>Product A</Tag>
          </Flex>
        </ModalHeader>
        <Divider />
        <ModalCloseButton />
        <Flex m={5} justifyContent={'space-between'} alignItems={'center'}>
          <Flex gap={4}>
            <FilterMenu
              title={'Components'}
              icon={FaFilter}
              value={targetComponent}
              onChange={(value) => setTargetComponent(value)}
              options={allComponents}
            />
            <FilterMenu
              title={'Vulnerability'}
              icon={FaFilter}
              value={targetVulnerability}
              onChange={(value) => setTargetVulnerability(value)}
              options={allVulnerabilities}
            />
          </Flex>
          <Menu>
            <MenuHeading title='Last 30 days' icon={FaCalendar} />
          </Menu>
        </Flex>
        <Divider />
        <ModalBody borderRadius={10} p={0}>
          <Flex m={5} justifyContent={'space-between'} alignItems={'center'}>
            <Menu>
              <MenuButton textTransform={'capitalize'}>
                <Flex gap={2} alignItems={'center'}>
                  {`Environment: ${env}`} <FaChevronDown />
                </Flex>
              </MenuButton>
              <MenuList>
                <MenuOptionGroup
                  value={env}
                  onChange={(value) => setEnv(value)}
                  type='radio'
                >
                  {['all', 'default', 'development', 'production'].map(
                    (item, index) => (
                      <MenuItemOption
                        key={index}
                        value={item}
                        fontSize='sm'
                        textTransform={'capitalize'}
                      >
                        {item}
                      </MenuItemOption>
                    )
                  )}
                </MenuOptionGroup>
              </MenuList>
            </Menu>
          </Flex>
          <Grid
            templateColumns='repeat(3, 1fr)'
            gap={4}
            marginTop={10}
            minHeight={600}
            p={5}
          >
            {renderTree(defaultData, 'default')}
            {renderTree(developmentData, 'development')}
            {renderTree(productionData, 'production')}
          </Grid>
        </ModalBody>
        <ModalFooter justifyContent={'flex-start'}>
          <Flex gap={12}>
            <LegendItem color={'#A0AEC0'} label={'Path'} />
            {targetComponent && (
              <LegendItem color={'#E53E3E'} label={'Components'} />
            )}
            {targetVulnerability && (
              <LegendItem color={'#0D0CEE'} label={'Vulnerability'} />
            )}
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ProductProgressModal

const getComponentNames = (node) => {
  let components = new Set()
  if (node.children) {
    for (const child of node.children) {
      const childComponents = getComponentNames(child)
      childComponents.forEach((component) => components.add(component))
    }
  } else if (node.attributes && node.attributes.type) {
    components.add(node.name)
  }
  return Array.from(components)
}

const getVulnerabilityNames = (node) => {
  let vulnerabilities = new Set()
  if (node.children) {
    for (const child of node.children) {
      const childVulnerabilities = getVulnerabilityNames(child)
      childVulnerabilities.forEach((vulnerability) =>
        vulnerabilities.add(vulnerability)
      )
    }
  } else if (node.attributes && node.attributes.severity) {
    vulnerabilities.add(node.name)
  }
  return Array.from(vulnerabilities)
}
