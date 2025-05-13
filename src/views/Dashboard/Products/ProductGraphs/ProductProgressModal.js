import { useState } from 'react'

import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Tag,
  Text
} from '@chakra-ui/react'

import LynkDrawer from 'components/LynkDrawer'

import { useThemeColor } from 'hooks/useThemeColors'

import { FaCode, FaDesktop, FaInbox } from 'react-icons/fa6'
import { LuFilter, LuInbox, LuPackage, LuShapes } from 'react-icons/lu'

import { defaultData } from './ProductProgressData'
import { developmentData } from './ProductProgressData'
import { productionData } from './ProductProgressData'
import Tree from './Tree'

const LegendItem = ({ color, label }) => {
  const { primaryTextColorWithOpacity } = useThemeColor([
    'primaryTextColorWithOpacity'
  ])

  return (
    <Flex gap={2} alignItems={'center'}>
      <Box height={'1.75px'} width={'40px'} backgroundColor={color} />
      <Text fontSize={12} fontWeight={400} color={primaryTextColorWithOpacity}>
        {label}
      </Text>
    </Flex>
  )
}

const MenuHeading = ({ title, icon: Icon, onClick, active }) => {
  const {
    primaryBlueText,
    secondaryBgColor,
    grayBorderColor,
    primaryTextColorWithOpacity
  } = useThemeColor([
    'primaryBlueText',
    'secondaryBgColor',
    'grayBorderColor',
    'primaryTextColorWithOpacity'
  ])

  return (
    <MenuButton
      as={Button}
      fontWeight='normal'
      fontSize='sm'
      leftIcon={
        <Icon
          size={14}
          color={active ? primaryBlueText : primaryTextColorWithOpacity}
        />
      }
      onClick={onClick}
      variant='outline'
      borderColor={active ? primaryBlueText : grayBorderColor}
      color={active ? primaryBlueText : primaryTextColorWithOpacity}
      backgroundColor={active ? secondaryBgColor : 'transparent'}
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
      <MenuList fontSize={'sm'}>
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

const ProductProgressModal = ({ isOpen, onClose, name }) => {
  const [targetComponent, setTargetComponent] = useState('')
  const [targetVulnerability, setTargetVulnerability] = useState('')
  const [env, setEnv] = useState([])

  const {
    primaryBlueText,
    secondaryBgColor,
    secondaryTextColor,
    primaryTextColorWithOpacity,
    mutedBorder,
    primaryErrorColor,
    vibrantBlue
  } = useThemeColor([
    'primaryBlueText',
    'secondaryBgColor',
    'secondaryTextColor',
    'primaryTextColorWithOpacity',
    'mutedBorder',
    'primaryErrorColor',
    'vibrantBlue'
  ])

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
        return <LuInbox size={18} />
      case 'development':
        return <LuShapes size={18} />
      case 'production':
        return <LuPackage size={18} />
    }
  }

  const renderTree = (data, envName) => {
    if (
      env.length === 0 ||
      env.includes('all') ||
      env.includes(envName.toLowerCase())
    ) {
      return (
        <Box
          border={'0.6px solid'}
          borderColor={mutedBorder}
          borderRadius={4}
          padding={3}
          maxWidth={'300px'}
        >
          <Flex gap={2} alignItems={'center'}>
            <Flex
              h={'24px'}
              w={'24px'}
              color={primaryBlueText}
              bg={secondaryBgColor}
              alignItems={'center'}
              justifyContent={'center'}
              borderRadius={4}
            >
              {envIcon(envName)}
            </Flex>
            <Text
              textTransform={'capitalize'}
              fontSize={14}
              color={primaryTextColorWithOpacity}
            >
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
    <>
      <LynkDrawer
        title={'Product TrailLynk'}
        subtitle={<Tag colorScheme='blue'>{name}</Tag>}
        isOpen={isOpen}
        onClose={onClose}
        size='xl'
        noFooter
      >
        <Flex my={2} justifyContent={'space-between'} alignItems={'center'}>
          <Flex gap={4}>
            <FilterMenu
              title={'Components'}
              icon={LuFilter}
              value={targetComponent}
              onChange={(value) => setTargetComponent(value)}
              options={allComponents}
            />
            <FilterMenu
              title={'Vulnerability'}
              icon={LuFilter}
              value={targetVulnerability}
              onChange={(value) => setTargetVulnerability(value)}
              options={allVulnerabilities}
            />
            <Menu>
              <MenuHeading
                title={'Environment'}
                icon={LuFilter}
                active={env.length > 0 && !env.includes('all')}
              />
              <MenuList fontSize={'sm'}>
                <MenuOptionGroup
                  value={env}
                  onChange={onFilterEnv}
                  type='checkbox'
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
        </Flex>
        {/* <Divider /> */}
        <Flex gap={4} minHeight={600} mt={4} justifyContent={'space-evenly'}>
          {renderTree(defaultData, 'default')}
          {renderTree(developmentData, 'development')}
          {renderTree(productionData, 'production')}
        </Flex>
        {/* Bottom */}
        <Flex position={'fixed'} bottom={5} gap={12}>
          <LegendItem color={secondaryTextColor} label={'Path'} />
          {targetComponent && (
            <LegendItem color={primaryErrorColor} label={'Components'} />
          )}
          {targetVulnerability && (
            <LegendItem color={vibrantBlue} label={'Vulnerability'} />
          )}
        </Flex>
      </LynkDrawer>
    </>
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
