import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text
} from '@chakra-ui/react'
import GlobalContext from 'context/GlobalContext'
import { useContext, useState } from 'react'

const components = [
  'dropwizard-core',
  'dropwizard-util',
  'guava',
  'failureaccess',
  'listenablefuture',
  'checker-qual',
  'error_prone_annotations',
  'j2objc-annotations',
  'dropwizard-jackson',
  'caffeine',
  'jackson-core',
  'jackson-datatype-guava',
  'jackson-datatype-jsr310',
  'jackson-datatype-jdk8',
  'jackson-module-parameter-names',
  'jackson-module-afterburner',
  'jackson-datatype-joda',
  'dropwizard-validation',
  'classmate',
  'jakarta.el'
]

const CheckModal = ({ isOpen, onClose, id, shortDesc }) => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const currentTime = `${hours}:${minutes}`

  const [timestamp, setTimestamp] = useState(currentTime)
  const [comp, setComp] = useState('')
  const [componentData, setComponentData] = useState([])

  const { healthCheckData, setHealthCheckData } = useContext(GlobalContext)

  const handleComponentChange = (e) => {
    const value = e.target.value
    setComp(value)
    if (value === '') {
      setComponentData([])
    } else {
      setComponentData(components)
    }
  }

  const heading = (name) => {
    switch (name) {
      case 'Timestamp':
        return 'Timestamp'
      case 'Primary Component':
        return 'Primary'
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const updatedItems = healthCheckData.map((item) => {
      if (item.id === id) {
        return { ...item, status: 'active' }
      }
      return item
    })
    setHealthCheckData(updatedItems)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <form onSubmit={handleSubmit}>
        <ModalContent>
          <ModalHeader>{heading(shortDesc)}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {shortDesc === 'Primary Component' && (
              <Flex
                flexDirection={'column'}
                alignItems={'flex-start'}
                gap={4}
                position={'relative'}
              >
                <FormControl isRequired>
                  <FormLabel>Component</FormLabel>
                  <Input value={comp} onChange={handleComponentChange} />
                </FormControl>

                {componentData && componentData.length > 0 && (
                  <Box
                    position='absolute'
                    zIndex='1'
                    width='100%'
                    top={12}
                    mt='8'
                    bg='white'
                    border='1px solid #ccc'
                    // height={'300px'}
                    overflowY={'scroll'}
                  >
                    <List>
                      {componentData
                        .filter((item) => item.includes(comp))
                        .map((item, index) => (
                          <ListItem
                            key={index}
                            cursor='pointer'
                            onClick={() => {
                              setComp(item)
                              setComponentData([])
                            }}
                            p='2'
                            _hover={{ background: 'gray.100' }}
                          >
                            <Text>{item}</Text>
                          </ListItem>
                        ))}
                    </List>
                  </Box>
                )}
              </Flex>
            )}

            {shortDesc === 'Timestamp' && (
              <FormControl isRequired>
                <FormLabel>Create At</FormLabel>

                <Input
                  placeholder='Select Time'
                  size='md'
                  type='time'
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                />
              </FormControl>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onClose}>
              Close
            </Button>
            <Button colorScheme='blue' type='submit'>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  )
}

export default CheckModal
