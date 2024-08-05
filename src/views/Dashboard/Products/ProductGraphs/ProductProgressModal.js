import { useState } from 'react'

import {
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Tag,
  Text,
  useColorModeValue
} from '@chakra-ui/react'

import { ZoomInIcon } from 'components/Icons/Icons'
import { ZoomOutIcon } from 'components/Icons/Icons'

import { FaCalendar, FaFilter } from 'react-icons/fa'
import { FaChevronDown } from 'react-icons/fa6'
import { FaCode, FaDesktop, FaInbox } from 'react-icons/fa6'

import { defaultData } from './ProductProgressData'
import { developmentData } from './ProductProgressData'
import { productionData } from './ProductProgressData'
import Tree from './Tree'

const LegendItem = ({ color, label }) => {
  const textColor = useColorModeValue('#030303', '#FFFFFFCC')
  return (
    <Flex gap={2} alignItems={'center'}>
      <Box height={'1.75px'} width={'40px'} backgroundColor={color} />
      <Text fontSize={12} fontWeight={400} color={textColor}>
        {label}
      </Text>
    </Flex>
  )
}

const MenuHeading = ({ title, icon: Icon, onClick, active }) => {
  const grayBorder = useColorModeValue('#1A202C29', '#ffffff29')
  const grayText = useColorModeValue('#1A202C', '#60686f')
  const bgActive = useColorModeValue('#EDF2F7', '')
  const iconColor = useColorModeValue('#3182CE', '#90cdf4')

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
  const handleChange = (selected) => {
    onChange(value === selected ? '' : selected)
  }

  return (
    <Menu>
      <MenuHeading title={title} icon={icon} active={!!value} />
      <MenuList>
        <MenuOptionGroup value={value} onChange={handleChange} type='radio'>
          {options.map((item, index) => (
            <MenuItemOption
              key={index}
              value={item}
              fontSize='sm'
              isChecked={value === item}
              onClick={() => handleChange(item)}
            >
              {item}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  )
}

const customDrawerStyle = {
  width: '960px',
  maxWidth: '960px',
  margin: 'auto'
}

const ProductProgressModal = ({ isOpen, onClose, name }) => {
  const [targetComponent, setTargetComponent] = useState('')
  const [targetVulnerability, setTargetVulnerability] = useState('')
  const [env, setEnv] = useState([])

  const bgColor = useColorModeValue('#EDF2F7', '#4D698166')
  const componentColor = useColorModeValue('#E53E3E', '#ff3c3c')
  const vulnerabilityColor = useColorModeValue('#0D0CEE', '#009bff')
  const strokeColor = useColorModeValue('#A0AEC0', '#A0AEC066')

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

  const onFilterEnv = (value) => {
    if (value.includes('all')) {
      setEnv([])
      return
    }
    const allEnvs = ['default', 'development', 'production']
    const selectedEnvs = new Set(value)

    if (allEnvs.every((env) => selectedEnvs.has(env))) {
      setEnv([])
    } else {
      setEnv([...selectedEnvs])
    }
  }

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
    const envColor = useColorModeValue('#1A202CCC', '#FFFFFF99')
    const grayBorder = useColorModeValue('#1A202C29', '#ffffff12')

    if (
      env.length === 0 ||
      env.includes('all') ||
      env.includes(envName.toLowerCase())
    ) {
      return (
        <Box
          border={'0.6px solid'}
          borderColor={grayBorder}
          borderRadius={4}
          padding={3}
        >
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
            <Text textTransform={'capitalize'} fontSize={14} color={envColor}>
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
        </Box>
      )
    }
    return null
  }

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size='xl'>
      <DrawerOverlay />
      <DrawerContent style={customDrawerStyle}>
        <DrawerHeader>
          <Flex align='center' gap={2}>
            <Text fontSize={20} fontWeight={500}>
              Product TrailLynk
            </Text>
            <Tag>{`Product ${name}`}</Tag>
          </Flex>
        </DrawerHeader>
        <Divider />
        <DrawerCloseButton />
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
        </Flex>
        <Divider />
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
          <Flex gap={3}>
            <IconButton
              icon={<ZoomOutIcon color={'#60686F'} />}
              onClick={() => {}}
              size='md'
              colorScheme='gray'
              variant='outline'
              fontSize='24px'
            />
            <IconButton
              icon={<ZoomInIcon color={'#60686F'} />}
              onClick={() => {}}
              size='md'
              colorScheme='gray'
              variant='outline'
              fontSize='24px'
            />
          </Flex>
        </Flex>
        <DrawerBody borderRadius={10} p={0}>
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
        </DrawerBody>
        <DrawerFooter justifyContent={'flex-start'}>
          <Flex gap={12}>
            <LegendItem color={'#A0AEC0'} label={'Path'} />
            {targetComponent && (
              <LegendItem color={'#E53E3E'} label={'Components'} />
            )}
            {targetVulnerability && (
              <LegendItem color={'#0D0CEE'} label={'Vulnerability'} />
            )}
          </Flex>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
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
