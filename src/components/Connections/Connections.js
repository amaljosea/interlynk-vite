import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'

import { CheckIcon } from '@chakra-ui/icons'
import { Button, Flex, Text, useDisclosure } from '@chakra-ui/react'

import { GetConnections } from 'graphQL/Queries'

import { FaJira } from 'react-icons/fa'

import Card from '../Card/Card'
import CardBody from '../Card/CardBody'
import CardHeader from '../Card/CardHeader'
import JiraConfigModal from './JiraConfigModal'

const Connections = () => {
  const { data, refetch } = useQuery(GetConnections, {
    fetchPolicy: 'network-only'
  })

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [greenCheck, setGreenCheck] = useState(false)

  useEffect(() => {
    if (
      data?.organization?.connections?.nodes[0]?.connection?.__typename ===
      'JiraConnection'
    ) {
      setGreenCheck(true)
    }
  }, [data])

  return (
    <>
      <Card p='16px'>
        <CardHeader p='12px 5px' mb='12px'>
          <Text fontSize='lg' fontWeight='bold'>
            Connected Accounts
          </Text>
        </CardHeader>
        <CardBody px='5px'>
          <Flex direction='column'>
            <Card
              height='200px'
              width='200px'
              borderWidth='1px'
              borderRadius='lg'
              overflow='hidden'
              boxShadow='lg'
            >
              <Flex align='center' justify='center' direction='column'>
                <FaJira size='25px' color='#0070f3' />
                <Text
                  noOfLines={1}
                  fontSize='md'
                  color='gray.500'
                  fontWeight='400'
                  pt='20px'
                >
                  Jira
                </Text>
                <Button colorScheme='blue' size='sm' mt='30px' onClick={onOpen}>
                  Configure
                </Button>
                {greenCheck && (
                  <CheckIcon
                    w={8}
                    h={8}
                    bg={'green.500'}
                    color={'white'}
                    border={'1px solid #4299E1'}
                    rounded={'full'}
                    p={'4px'}
                    position={'absolute'}
                    right={1}
                    top={1}
                  />
                )}
              </Flex>
            </Card>
          </Flex>
        </CardBody>
      </Card>

      {isOpen && (
        <JiraConfigModal
          isOpen={isOpen}
          onClose={onClose}
          data={data?.organization?.connections?.nodes[0]}
          setGreenCheck={setGreenCheck}
          refetch={refetch}
        />
      )}
    </>
  )
}

export default Connections
