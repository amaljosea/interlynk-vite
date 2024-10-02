import React from 'react'

import { Flex, Icon, Link, Tag, Td, Text, Tr } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

function ProductsOverviewTableRow(props) {
  const { logo, name, description, versions, sbom_links, risk_score } = props
  const { inverseSecondaryBgColor } = useThemeColor(['inverseSecondaryBgColor'])
  return (
    <Tr>
      <Td minWidth={{ sm: '250px' }} pl='0px'>
        <Flex align='center' py='.1rem' minWidth='100%' flexWrap='nowrap'>
          <Flex align='center' direction='row'>
            <Icon as={logo} h={'24px'} w={'24px'} me='18px' />
            <Flex direction='column'>
              <Text
                fontSize='sm'
                color={inverseSecondaryBgColor}
                fontWeight='semibold'
                minWidth='100%'
              >
                <Link href='#/vendor/products'>{name}</Link>
              </Text>
              <Text
                fontSize='xs'
                color={inverseSecondaryBgColor}
                minWidth='100%'
              >
                {description}
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Td>
      <Td>
        <Text fontSize='sm' color={inverseSecondaryBgColor}>
          {versions.length}
        </Text>
      </Td>
      <Td>
        <Text fontSize='sm' color={inverseSecondaryBgColor}>
          {sbom_links}
        </Text>
      </Td>
      <Td>
        <Flex minWidth='max-content' alignItems='center' gap='2'>
          <Tag
            minW='35px'
            alignItems='center'
            colorScheme={
              risk_score > 25 ? 'red' : risk_score > 20 ? 'blue' : 'green'
            }
          >
            {risk_score}
          </Tag>
        </Flex>
      </Td>
    </Tr>
  )
}

export default ProductsOverviewTableRow
