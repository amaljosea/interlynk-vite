import React from 'react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { isCustomerView } from 'utils'

import { Button, Flex, Icon, Tag, Td, Text, Tr } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import { FaEllipsisV } from 'react-icons/fa'

function CustomerComponentRow(props) {
  const {
    logo,
    component,
    version,
    source,
    depth,
    dependsOn,
    language,
    license,
    updated,
    repo,
    risk_score,
    critical,
    high,
    medium,
    low,
    redacted
  } = props
  const location = useLocation()
  const { inverseSecondaryBgColor, secondaryTextColor } = useThemeColor([
    'inverseSecondaryBgColor',
    'secondaryTextColor'
  ])

  const [contains, setcontains] = useState({})

  useEffect(() => {
    const containsData = window.localStorage.getItem('contains')
    setcontains(JSON.parse(containsData))
  }, [])

  return (
    <Tr>
      <Td minWidth={{ sm: '250px' }} pl='0px'>
        <Flex align='center' py='.8rem' minWidth='100%' flexWrap='nowrap'>
          <Flex direction='row'>
            <Icon as={logo} h={'24px'} w={'24px'} me='18px' />
            <Flex direction='column' gap='5px'>
              <Text
                fontSize='sm'
                color={inverseSecondaryBgColor}
                minWidth='100%'
              >
                {contains && contains.redactions && redacted
                  ? 'Redacted-DC...gM='
                  : component}
              </Text>
              {redacted ? (
                <Tag
                  colorScheme='red'
                  size='sm'
                  variant='outline'
                  width={'fit-content'}
                >
                  REDACTED
                </Tag>
              ) : null}
            </Flex>
          </Flex>
        </Flex>
      </Td>
      <Td>
        <Flex direction='column'>
          <Text fontSize='sm' color={inverseSecondaryBgColor}>
            {version}
          </Text>
        </Flex>
      </Td>
      <Td>{dependsOn}</Td>
      <Td>{license}</Td>
      {isCustomerView() ? (
        ''
      ) : (
        <Td>
          <Tag
            minW='40px'
            colorScheme={
              risk_score > 25 ? 'red' : risk_score > 20 ? 'blue' : 'green'
            }
          >
            {risk_score}
          </Tag>
        </Td>
      )}
      {/* <Td>
        <Flex direction='row' gap='2'>
          <Tag size='md' variant='subtle' colorScheme='red'>
            <TagLeftIcon boxSize='12px' as={LetterCIcon} />
            <TagLabel>{critical}</TagLabel>
          </Tag>
          <Tag size='md' variant='subtle' colorScheme='orange'>
            <TagLeftIcon boxSize='12px' as={LetterHIcon} />
            <TagLabel>{high}</TagLabel>
          </Tag>
          <Tag size='md' variant='subtle' colorScheme='yellow'>
            <TagLeftIcon boxSize='12px' as={LetterMIcon} />
            <TagLabel>{medium}</TagLabel>
          </Tag>
          <Tag size='md' variant='subtle' colorScheme='green'>
            <TagLeftIcon boxSize='12px' as={LetterLIcon} />
            <TagLabel>{low}</TagLabel>
          </Tag>
        </Flex>
      </Td>
      <Td>{updated}</Td> */}
      <Td>
        <Button title='Component actions' p='0px' bg='transparent'>
          <Icon as={FaEllipsisV} color={secondaryTextColor} cursor='pointer' />
        </Button>
      </Td>
    </Tr>
  )
}

export default CustomerComponentRow
