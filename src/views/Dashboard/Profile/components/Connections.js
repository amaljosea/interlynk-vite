// Chakra imports
import { useEffect, useState } from 'react'

import { CheckIcon } from '@chakra-ui/icons'
import {
  Button,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Switch,
  Text,
  useColorModeValue
} from '@chakra-ui/react'

// Custom components
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'

import { useGlobalState } from 'hooks/useGlobalState'

import {
  FaDocker,
  FaGithubSquare,
  FaGitlab,
  FaJira,
  FaSlack
} from 'react-icons/fa'

const Connections = () => {
  // Chakra color mode
  const textColor = useColorModeValue('gray.700', 'white')
  const [isSwitchOn, setIsSwitchOn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { activeDockerHub, setActiveDockerHub } = useGlobalState()

  const handleSwitchChange = () => {
    setIsSwitchOn(!isSwitchOn)
  }

  const handleButtonClick = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 3000)
  }

  const handleActive = () => {
    window.localStorage.setItem('DockerHub', !activeDockerHub)
    setActiveDockerHub(!activeDockerHub)
  }

  // console.log('activeDockerHub', activeDockerHub)

  useEffect(() => {
    if (!isSwitchOn) {
      setIsLoading(false)
    }
  }, [isSwitchOn])

  return (
    <Card p='16px'>
      <CardHeader p='12px 5px' mb='12px'>
        <Text fontSize='lg' color={textColor} fontWeight='bold'>
          Connected Accounts
        </Text>
      </CardHeader>
      <CardBody px='5px'>
        <Flex direction='column'>
          <Text fontSize='sm' color='gray.500' fontWeight='600' mb='20px'>
            Repositories
          </Text>
          <Flex align='center' mb='20px' direction='row'>
            <Switch
              colorScheme='blue'
              me='10px'
              checked={isSwitchOn}
              onChange={handleSwitchChange}
            />
            <FaGithubSquare size='25px' color='blue' />
            <Text
              noOfLines={1}
              fontSize='md'
              color='gray.500'
              px='10px'
              fontWeight='400'
            >
              Github
            </Text>
            {isSwitchOn && (
              <>
                <Flex align='center' direction='row' me='10px'>
                  <InputGroup>
                    <Input placeholder='GITHUB_TOKEN' width='auto' size='sm' />
                    {isLoading ? (
                      <InputRightElement>
                        <CheckIcon color='green.500' />
                      </InputRightElement>
                    ) : (
                      <></>
                    )}
                  </InputGroup>
                  <Button
                    colorScheme='blue'
                    size='sm'
                    onClick={handleButtonClick}
                    disabled={isLoading}
                  >
                    {isLoading ? <Spinner size='sm' /> : 'Save'}
                  </Button>
                </Flex>
              </>
            )}
          </Flex>
          <Flex align='center' mb='20px' direction='row'>
            <Switch colorScheme='blue' me='10px' />
            <FaGitlab size='25px' color='blue' />
            <Text
              noOfLines={1}
              fontSize='md'
              color='gray.500'
              px='10px'
              fontWeight='400'
            >
              Gitlab
            </Text>
          </Flex>
          <Text fontSize='sm' color='gray.500' fontWeight='600' mb='20px'>
            Container Registries
          </Text>
          <Flex align='center' mb='20px' direction='row'>
            <Switch
              colorScheme='blue'
              me='10px'
              isChecked={activeDockerHub}
              onChange={handleActive}
            />
            <FaDocker size='25px' color='blue' />
            <Text
              noOfLines={1}
              fontSize='md'
              color='gray.500'
              px='10px'
              fontWeight='400'
            >
              Docker Hub
            </Text>
          </Flex>
          <Text fontSize='sm' color='gray.500' fontWeight='600' mb='20px'>
            Workflows
          </Text>
          <Flex align='center' mb='20px' direction='row'>
            <Switch colorScheme='blue' me='10px' />
            <FaJira size='25px' color='blue.300' />
            <Text
              noOfLines={1}
              fontSize='md'
              color='gray.500'
              px='10px'
              fontWeight='400'
            >
              JIRA
            </Text>
          </Flex>
          <Flex align='center' mb='20px' direction='row'>
            <Switch colorScheme='blue' me='10px' />
            <FaSlack size='25px' color='blue' />
            <Text
              noOfLines={1}
              fontSize='md'
              color='gray.500'
              px='10px'
              fontWeight='400'
            >
              Slack
            </Text>
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  )
}

export default Connections
