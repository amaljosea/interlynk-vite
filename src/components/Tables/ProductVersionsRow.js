import {
  IconButton,
  Flex,
  Td,
  Text,
  Tr,
  useColorModeValue,
  Icon,
  Switch,
  Menu,
  MenuItem,
  MenuButton,
  MenuList,
  Portal,
  useDisclosure
} from '@chakra-ui/react'
import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { productVersionsData } from 'variables/general'

import { FaEllipsisV } from 'react-icons/fa'
import { timeSince } from 'utils'
import ProductModal from 'views/Dashboard/Products/components/ProductModal'

function ProductVersionsRow(props) {
  const {
    id,
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
  const btnRef = useRef()
  const url = `/vendor/sboms?p=${name}&v=${version}`

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

  return (
    <>
      <Tr>
        <Td pl={0}>
          <Switch
            isChecked={checked}
            onChange={(e) => setChecked(!checked)}
            size='md'
          />
        </Td>

        <Td pl={0}>
          <Flex direction='row' align='center'>
            <Icon as={logo} h={'24px'} w={'24px'} me='18px' />
            <Flex direction='column'>
              <Text
                fontSize='sm'
                fontWeight='semibold'
                color={textColor}
                minWidth='100%'
              >
                <Link to={url}>{name}</Link>
              </Text>
              <Text fontSize='xs' color={textColor} minWidth='100%'>
                {description}
              </Text>
            </Flex>
          </Flex>
        </Td>
        <Td pl={0}>
          <Flex direction='column'>
            <Text fontSize='sm' color={textColor}>
              {vendor}
            </Text>
          </Flex>
        </Td>
        <Td pl={0}>
          <Flex direction='column'>
            <Text fontSize='sm' color={textColor}>
              {version}
            </Text>
          </Flex>
        </Td>
        <Td pl={0}>
          <Text fontSize='sm' color={textColor}>
            {timeSince(updated_at)}
          </Text>
        </Td>
        <Td pl={0}>
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
                <MenuItem onClick={onOpen}>Edit</MenuItem>
                <MenuItem>Archive</MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        </Td>
      </Tr>

      <ProductModal
        isOpen={isOpen}
        onClose={onClose}
        product={name}
        vendorName={vendor}
      />
    </>
  )
}

export default ProductVersionsRow
