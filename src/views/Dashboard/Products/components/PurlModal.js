import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Select,
  Checkbox,
  Flex,
  Input
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'

const PurlModal = ({ data, isOpen, onClose, purlValue, setPurlValue }) => {
  const [type, setType] = useState('')
  const [namespace, setNamespace] = useState('')
  const [purlName, setPurlName] = useState('')
  const [purlVersion, setPurlVersion] = useState('')

  const [updatedString, setUpdatedString] = useState(purlValue)

  useEffect(() => {
    if (data) {
      setType(data.type)
      setNamespace(data.namespace)
      setPurlName(data.name)
      setPurlVersion(data.version)
    }
  }, [data])

  const handleTypeChange = (e) => {
    setType(e.target.value)
    const value = purlValue.replace(data.type, e.target.value)
    setUpdatedString(value)
  }

  const handleNamespaceChange = (e) => {
    setNamespace(e.target.value)
    const value = purlValue.replace(data.namespace, e.target.value)
    setUpdatedString(value)
  }

  const handleNameChange = (e) => {
    setPurlName(e.target.value)
    const value = purlValue.replace(data.name, e.target.value)
    setUpdatedString(value)
  }

  const handleVersionChange = (e) => {
    setPurlVersion(e.target.value)
    const value = purlValue.replace(data.version, e.target.value)
    setUpdatedString(value)
  }

  const handleSave = () => {
    setPurlValue(updatedString)
    onClose()
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex width={'100%'} direction={'column'} gap={4}>
              {/* Type */}
              <FormControl>
                <FormLabel>
                  <Checkbox
                    size='md'
                    colorScheme='green'
                    defaultChecked={true}
                    readOnly
                  >
                    Type
                  </Checkbox>
                </FormLabel>
                <Select
                  size='md'
                  id='type'
                  name='type'
                  value={type}
                  onChange={handleTypeChange}
                >
                  <option value=''>-- Select --</option>
                  <option value='alpm'>alpm</option>
                  <option value='apk'>apk</option>
                  <option value='bitbucket'>bitbucket</option>
                  <option value='bitnami'>bitnami</option>
                  <option value='cocoapods '>cocoapods</option>
                  <option value='cargo'>cargo</option>
                  <option value='composer'>composer</option>
                  <option value='conan'>conan</option>
                  <option value='conda'>conda</option>
                  <option value='cran'>cran</option>
                  <option value='deb'>deb</option>
                  <option value='docker'>docker</option>
                  <option value='gem'>gem</option>
                  <option value='generic'>generic</option>
                  <option value='github'>github</option>
                  <option value='golang'>golang</option>
                  <option value='hex'>hex</option>
                  <option value='huggingface'>huggingface</option>
                  <option value='maven'>maven</option>
                  <option value='mlflow'>mlflow</option>
                  <option value='npm'>npm</option>
                  <option value='nuget'>nuget</option>
                  <option value='qpkg'>qpkg</option>
                  <option value='oci'>oci</option>
                  <option value='pub'>pub</option>
                  <option value='pypi'>pypi</option>
                  <option value='rpm'>rpm</option>
                  <option value='swid'>swid</option>
                  <option value='swift'>swift</option>
                </Select>
              </FormControl>
              {/* Namespace */}
              <FormControl>
                <FormLabel>
                  <Checkbox
                    size='md'
                    colorScheme='green'
                    defaultChecked={true}
                    readOnly
                  >
                    Namespace
                  </Checkbox>
                </FormLabel>
                <Select
                  size='md'
                  id='namespace'
                  name='namespace'
                  value={namespace}
                  onChange={handleNamespaceChange}
                >
                  <option value=''>-- Select --</option>
                  <option value='arch'>arch</option>
                  <option value='arch32'>arch32</option>
                  <option value='archarm'>archarm</option>
                  <option value='manjaro '>manjaro</option>
                  <option value='alpine'>alpine</option>
                  <option value='openwrt'>openwrt</option>
                  <option value='debian'>debian</option>
                  <option value='ubuntu'>ubuntu</option>
                  <option value='birkenfeld'>birkenfeld</option>
                  <option value='wordpress'>wordpress</option>
                  <option value='AFNetworking'>AFNetworking</option>
                  <option value='MapsIndoors'>MapsIndoors</option>
                  <option value='rand'>rand</option>
                  <option value='clap'>clap</option>
                  <option value='structopt'>structopt</option>
                  <option value='openssl'>openssl</option>
                  <option value='caret'>caret</option>
                </Select>
              </FormControl>
              {/* Name */}
              <FormControl>
                <Checkbox
                  size='md'
                  colorScheme='green'
                  defaultChecked={true}
                  readOnly
                >
                  Name
                </Checkbox>
                <Input
                  type='text'
                  mt={1.5}
                  value={purlName}
                  size='md'
                  onChange={handleNameChange}
                />
              </FormControl>
              {/* Version */}
              <FormControl>
                <Checkbox
                  size='md'
                  colorScheme='green'
                  defaultChecked={true}
                  readOnly
                >
                  Version
                </Checkbox>
                <Input
                  size='md'
                  mt={1.5}
                  type='text'
                  value={purlVersion}
                  onChange={handleVersionChange}
                />
              </FormControl>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button fontSize={'sm'} colorScheme='gray' mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              fontSize={'sm'}
              variant='solid'
              colorScheme={'blue'}
              onClick={handleSave}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default PurlModal
