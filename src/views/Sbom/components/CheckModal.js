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
  'Biotronik.Cabo.Business.Communication-0.0.0-UnknownVersionBiotronik.Cabo.Business.Communication-0.0.0-UnknownVersion',
  'Biotronik.Cabo.Business.Communication.BLECommunicationLayer.Android-0.0.0-UnknownVersion',
  'Biotronik.Cabo.Business.Communication.CommSim-0.0.0-UnknownVersion',
  'Biotronik.Cabo.Business.Database-0.0.0-UnknownVersion',
  'Biotronik.Cabo.Business.Database.Android-0.0.0-UnknownVersion',
  'Biotronik.Cabo.Business.ImplantCommunication-0.0.0-UnknownVersion',
  'Biotronik.Cabo.Business.Interfaces-0.0.0-UnknownVersion',
  'Biotronik.Cabo.Business.ModelEntities-0.0.0-UnknownVersion',
  'Biotronik.Cabo.Business.PPS.Container-0.0.0-UnknownVersion',
  'Biotronik.Cabo.Business.PPS.Container.Android-0.0.0-UnknownVersion',
  'Biotronik.Cabo.CP.Translation.Resource-1.8.0',
  'Biotronik.Cabo.Cpf-0.0.0-UnknownVersion',
  'Biotronik.Cabo.Cpf.Android-0.0.0-UnknownVersion',
  'Biotronik.Cabo.MDP.Translation.Resource-1.9.0',
  'Biotronik.Cabo.Mdp-0.0.0-UnknownVersion',
  'Biotronik.Cabo.Mdp.Android-0.0.0-UnknownVersion',
  'Biotronik.Cabo.Mdp.ModelAdmin-0.0.0-UnknownVersion',
  'Biotronik.Cabo.PR.Translation.Resource-1.8.0',
  'Biotronik.Cabo.PrApp-0.0.0-UnknownVersion',
  'Biotronik.Cabo.Shared-0.0.0-UnknownVersion',
  'Biotronik.Cabo.Shared.Android-0.0.0-UnknownVersion',
  'Biotronik.Cabo.UI-0.0.0-UnknownVersion',
  'Biotronik.Cabo.UI.Android-0.0.0-UnknownVersion',
  'Biotronik.ScsApp.Pr-1.0.0',
  'Biotronik.ScsApp.Pr.ModelAdminPlugin-1.0.0',
  'Biotronik.ScsApp.Pr.PPS.Lib.Android.ARM-1.0.0',
  'Biotronik.ScsApp.Pr.PPS.Lib.Android.ARM64-1.0.0',
  'Biotronik.ScsApp.Pr.PPS.Lib.Android.x64-1.0.0',
  'Biotronik.ScsApp.Pr.PPS.Lib.Android.x86-1.0.0',
  'Biotronik.ScsApp.Shared-1.0.0',
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
  // const currentTime = `${hours}:${minutes}`
  const currentTime = now.toISOString().slice(0, 16)

  const [timestamp, setTimestamp] = useState(currentTime)
  const [comp, setComp] = useState('')
  const [componentData, setComponentData] = useState([])

  const {
    healthCheckData,
    setHealthCheckData,
    automationRules,
    setAutomationRules
  } = useContext(GlobalContext)

  const handleComponentChange = (e) => {
    const value = e.target.value
    setComp(value)
    if (value === '') {
      setComponentData([])
    } else {
      setComponentData(components.filter((str) => str.startsWith(value)))
    }
  }

  const heading = (name) => {
    switch (name) {
      case 'Timestamp':
        return 'Timestamp'
      case 'Primary Component':
        return 'Primary Component'
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

    if (shortDesc === 'Primary Component') {
      const newRow = {
        id: Date.now(),
        active: true,
        selectorOne: 'document',
        conditionOne: '',
        selectorTwo: 'Primary Component',
        conditionTwo: 'Missing',
        fixAction: ''
      }
      setAutomationRules([newRow, ...automationRules])
    }

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
                  <FormLabel>Select</FormLabel>
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

            {shortDesc === 'Creation Time' && (
              <FormControl isRequired>
                <FormLabel>Created At</FormLabel>
                <Input
                  placeholder='Select Time'
                  size='md'
                  type='datetime-local'
                  value={timestamp}
                  onChange={(e) => console.log(e.target.value)}
                />
              </FormControl>
            )}
          </ModalBody>

          <ModalFooter>
            <Button fontSize={'sm'} mr={3} onClick={onClose}>
              Close
            </Button>
            <Button fontSize={'sm'} colorScheme='green' mr={3} type='submit'>
              Save Rule
            </Button>
            <Button fontSize={'sm'} colorScheme='blue' type='submit'>
              Save Value
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  )
}

export default CheckModal
