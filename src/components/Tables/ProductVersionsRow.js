import {
  Tag,
  IconButton,
  Flex,
  Td,
  Text,
  Tr,
  useColorModeValue,
  Link,
  Icon,
  Switch,
  Menu,
  MenuItem,
  MenuButton,
  MenuList,
  Portal,
  useDisclosure
} from '@chakra-ui/react'
import React, { useState } from 'react'
import {
  LinkIcon,
  DeleteIcon,
  ExternalLinkIcon,
  SearchIcon
} from '@chakra-ui/icons'
import SBOMLinkDrawer from 'components/Drawer/SBOMLinkDrawer.js'
import { productVersionsData } from 'variables/general'

import { FaEllipsisV } from 'react-icons/fa'
import SBOMDrawer from 'components/Drawer/SBOMDrawer'

function ProductVersionsRow(props) {
  const {
    logo,
    name,
    version,
    sbomlinks,
    risk_score,
    updated_at,
    active,
    description,
    vendor,
    quality_score
  } = props
  const textColor = useColorModeValue('gray.700', 'white')
  const [checked, setChecked] = useState(active ? true : false)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const uniqProjects = []
  const btnRef = React.useRef()
  const url = `#/vendor/sboms?p=${name}&v=${version}`

  productVersionsData.map((project) => {
    if (uniqProjects.indexOf(project.name) === -1) {
      uniqProjects.push(project.name)
    }
  })
  const uniqVersions = []
  productVersionsData.map((project) => {
    project.versions.map((version) => {
      if (uniqVersions.indexOf(version.version) === -1) {
        uniqVersions.push(version.version)
      }
    })
  })

  function timeSince(dateStr) {
    var date = new Date(dateStr)
    var seconds = Math.floor((new Date() - date) / 1000)
    var interval = seconds / 31536000
    if (interval > 1) {
      return Math.floor(interval) + ' years ago'
    }
    interval = seconds / 2592000
    if (interval > 1) {
      return Math.floor(interval) + ' months ago'
    }
    interval = seconds / 86400
    if (interval > 1) {
      return Math.floor(interval) + ' days ago'
    }
    interval = seconds / 3600
    if (interval > 1) {
      return Math.floor(interval) + ' hours ago'
    }
    interval = seconds / 60
    if (interval > 1) {
      return Math.floor(interval) + ' minutes ago'
    }
    return Math.floor(seconds) + ' seconds ago'
  }

  return (
    <Tr>
      <Td>
        <Switch
          isChecked={checked}
          onChange={(e) => setChecked(!checked)}
          size='md'
        />
      </Td>

      <Td minWidth={{ sm: '250px' }} pl='0px'>
        <Flex align='center' py='.2rem' minWidth='100%' flexWrap='nowrap'>
          <Flex direction='row' align='center'>
            <Icon as={logo} h={'24px'} w={'24px'} me='18px' />
            <Flex direction='column'>
              <Text
                fontSize='sm'
                fontWeight='semibold'
                color={textColor}
                minWidth='100%'
              >
                <Link href={url}>{name}</Link>
              </Text>
              <Text fontSize='xs' color={textColor} minWidth='100%'>
                {description}
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Td>
      <Td>
        <Flex direction='column'>
          <Text fontSize='sm' color={textColor}>
            {vendor}
          </Text>
        </Flex>
      </Td>
      <Td>
        <Flex minWidth='max-content' alignItems='center' gap='2'>
          <Tag
            minW='35px'
            colorScheme={
              quality_score === 0
                ? 'gray'
                : quality_score >= 3 && quality_score < 5
                ? 'red'
                : quality_score >= 6 && quality_score < 8
                ? 'blue'
                : 'green'
            }
          >
            {quality_score}
          </Tag>
        </Flex>
      </Td>
      <Td>
        <Flex direction='column'>
          <Text fontSize='sm' color={textColor}>
            {version}
          </Text>
        </Flex>
      </Td>
      <Td>{sbomlinks}</Td>
      <Td>
        <Flex minWidth='max-content' alignItems='center' gap='2'>
          <Tag
            minW='35px'
            colorScheme={
              risk_score > 25 ? 'red' : risk_score > 20 ? 'blue' : 'green'
            }
          >
            {risk_score}
          </Tag>
        </Flex>
      </Td>
      <Td>
        <Text fontSize='sm' color={textColor}>
          {timeSince(updated_at)}
        </Text>
      </Td>
      <Td>
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label='Options'
            icon={<FaEllipsisV />}
            variant='none'
            color='gray.400'
          />
          <Portal>
            <MenuList size='sm'>
              <MenuItem onClick={onOpen}>Create SBOM Link</MenuItem>
              <MenuItem>Download SBOM</MenuItem>
              <MenuItem>{active ? 'Deactivate' : 'Activate'}</MenuItem>
              <MenuItem>Archive</MenuItem>
            </MenuList>
          </Portal>
        </Menu>
        <SBOMDrawer
          isOpen={isOpen}
          onClose={onClose}
          btnRef={btnRef}
          uniqProjects={uniqProjects}
          uniqVersions={uniqVersions}
        />
      </Td>
    </Tr>
  )
}

export default ProductVersionsRow
