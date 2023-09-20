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
  Input,
  Stack,
  Progress
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { PackageURL } from 'packageurl-js'

const typeOptions = [
  { value: '', label: '-- Select --' },

  { value: 'alpm', label: 'alpm' },
  { value: 'apk', label: 'apk' },

  { value: 'bitbucket', label: 'bitbucket' },
  { value: 'bitnami', label: 'bitnami' },

  { value: 'cocoapods', label: 'cocoapods' },
  { value: 'cargo', label: 'cargo' },
  { value: 'composer', label: 'composer' },
  { value: 'conan', label: 'conan' },
  { value: 'conda', label: 'conda' },
  { value: 'cran', label: 'cran' },

  { value: 'deb', label: 'deb' },
  { value: 'docker', label: 'docker' },

  { value: 'gem', label: 'gem' },
  { value: 'generic', label: 'generic' },
  { value: 'github', label: 'github' },
  { value: 'golang', label: 'golang' },

  { value: 'hex', label: 'hex' },
  { value: 'huggingface', label: 'huggingface' },

  { value: 'maven', label: 'maven' },
  { value: 'mlflow', label: 'mlflow' },

  { value: 'npm', label: 'npm' },
  { value: 'nuget', label: 'nuget' },

  { value: 'qpkg', label: 'qpkg' },

  { value: 'oci', label: 'oci' },

  { value: 'pub', label: 'pub' },
  { value: 'pypi', label: 'pypi' },

  { value: 'rpm', label: 'rpm' },

  { value: 'swid', label: 'swid' },
  { value: 'swift', label: 'swift' }
];

const namespaceOptions = {
  alpm: [
    { value: '', label: '-- Select --' },
    { value: 'arch', label: 'arch' },
    { value: 'arch32', label: 'arch32' },
    { value: 'archarm', label: 'archarm' },
    { value: 'manjaro', label: 'manjaro' },
    { value: 'msys', label: 'msys' },
  ],
  apk: [
    { value: '', label: '-- Select --' },
    { value: 'alpine', label: 'alpine' },
    { value: 'openwrt', label: 'openwrt' },
  ],
  bitnami: [],
  cocoapods: [],
  cargo: [],
  conda: [],
  cran: [],
  deb: [
    { value: '', label: '-- Select --' },
    { value: 'debian', label: 'debian' },
    { value: 'ubuntu', label: 'ubuntu' },
  ],
  gem: [],
  generic: [],
  hackage: [],
  mflow: [],
  nuget: [],
  oci: [],
  pub: [],
  pypi: []
};

const PurlModal = ({ data, isOpen, onClose, purlValue, setPurlValue }) => {
  const [purlType, setPurlType] = useState('')
  const [namespace, setNamespace] = useState('')
  const [purlName, setPurlName] = useState('')
  const [purlVersion, setPurlVersion] = useState('')
  const [nameProgressValue, setNameProgressValue] = useState(0);
  const [verProgressValue, setVerProgressValue] = useState(0);

  const [updatedString, setUpdatedString] = useState(purlValue)

  useEffect(() => {
    if (data) {
      setPurlType(data.type)
      setNamespace(data.namespace)
      setPurlName(data.name)
      setPurlVersion(data.version)
      setNameProgressValue(calculateProgress(data.type, data.name, ''));
      setVerProgressValue(calculateProgress(data.type, data.name, data.version));
    }
  }, [data])

  const calculateProgress = (type, name, version) => {
    const vendorMap = {};
    vendorMap[['deb', 'bash', ''].join(',')] = 100;
    vendorMap[['deb', 'bash', '5.1-6ubuntu1'].join(',')] = 100;
    vendorMap[['deb', 'binutils-common', ''].join(',')] = 100;
    vendorMap[['deb', 'binutils-common', '2.38-4ubuntu2.3'].join(',')] = 100;
    vendorMap[['deb', 'binutils-x86-64-linux-gnu', ''].join(',')] = 100;
    vendorMap[['deb', 'binutils-x86-64-linux-gnu', '2.38-4ubuntu2.3'].join(',')] = 100;
    vendorMap[['deb', 'binutils', ''].join(',')] = 100;
    vendorMap[['deb', 'binutils', '2.38-4ubuntu2.3'].join(',')] = 100;
    vendorMap[['deb', 'bsdutils', ''].join(',')] = 100;
    vendorMap[['deb', 'bzip2', ''].join(',')] = 100;
    vendorMap[['deb', 'bzip2', '1.0.8-4'].join(',')] = 100;
    vendorMap[['deb', 'ca-certificates', ''].join(',')] = 100;
    vendorMap[['deb', 'ca-certificates', '20210119~20.04.1'].join(',')] = 100;
    vendorMap[['deb', 'coreutils', ''].join(',')] = 100;
    vendorMap[['deb', 'coreutils', '8.30-3ubuntu2'].join(',')] = 100;

    var newValue = vendorMap[[type.toLowerCase(), name.toLowerCase(), version.toLowerCase()].join(',')];
    console.log('Type:' + type, 'Name:' + name, 'Version:' + version, newValue)
    if (isNaN(newValue)) {
      newValue = 0;
    }
    return newValue;
  };

  const getProgressColor = (value) => {
    if (value >= 90) {
      return 'green'; // Change color to green if progress is 90% or higher
    } else if (value >= 50) {
      return 'yellow'; // Change color to yellow if progress is 50% or higher
    } else {
      return 'red'; // Change color to red for lower progress values
    }
  };

  const handleTypeChange = (e) => {
    console.log('handleTypeChange', e.target.value, updatedString)
    setPurlType(e.target.value)
    const pkg = PackageURL.fromString(updatedString);
    pkg.type = e.target.value;
    pkg.namespace = '';
    setUpdatedString(pkg.toString())
    const nameProgressValue = calculateProgress(pkg.type, pkg.name, '');
    console.log('nameProgressValue', nameProgressValue)
    setNameProgressValue(nameProgressValue);

    const verProgressValue = calculateProgress(pkg.type, pkg.name, pkg.version);
    console.log('verProgressValue', verProgressValue)
    setVerProgressValue(verProgressValue);


    console.log('Done handleTypeChange', e.target.value, pkg.toString(), updatedString)

  }

  const handleNamespaceChange = (e) => {
    console.log('handleNamespaceChange', e.target.value, updatedString)
    setNamespace(e.target.value)
    const pkg = PackageURL.fromString(updatedString);
    pkg.namespace = e.target.value;
    setUpdatedString(pkg.toString())
  }

  const handleNameChange = (e) => {
    console.log('handleNameChange', e.target.value, updatedString)
    setPurlName(e.target.value)
    if (e.target.value === '') {
      return;
    }
    const pkg = PackageURL.fromString(updatedString);
    pkg.name = e.target.value;
    setUpdatedString(pkg.toString())

    const nameProgressValue = calculateProgress(pkg.type, e.target.value, '');
    console.log('nameProgressValue', nameProgressValue)
    setNameProgressValue(nameProgressValue);
  }

  const handleVersionChange = (e) => {
    setPurlVersion(e.target.value)
    const pkg = PackageURL.fromString(updatedString);
    pkg.version = e.target.value;
    setUpdatedString(pkg.toString())

    const verProgressValue = calculateProgress(pkg.type, pkg.name, e.target.value);
    console.log('verProgressValue', verProgressValue)
    setVerProgressValue(verProgressValue);
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
          <ModalHeader>PURL Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex width={'100%'} direction={'column'} gap={4}>
            <FormControl>
              <FormLabel>
                Package URL
              </FormLabel>
              <Input
                  type='text'
                  variant='filled'
                  mt={1.5}
                  value={updatedString}
                  size='md'
                  onChange={handleVersionChange}
                  disabled
                />
            </FormControl>
              {/* Type */}
              <FormControl>
                <FormLabel>
                    Package Type
                </FormLabel>
                <Select
                  size='md'
                  id='type'
                  name='type'
                  value={purlType}
                  onChange={handleTypeChange}
                >
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
              {/* Namespace */}
                {!namespaceOptions.hasOwnProperty(type) ? (
                  <FormControl>
                  <FormLabel>Namespace</FormLabel>
                  <Input
                    type='text'
                    mt={1.5}
                    size='md'
                    value={namespace}
                    onChange={handleNamespaceChange}
                  />
                  </FormControl>
                ) : (
                  namespaceOptions[type] && namespaceOptions[type].length > 0 ? (
                    <FormControl>
                  <FormLabel>Namespace</FormLabel>
                    <Select
                      size='md'
                      id='namespace'
                      name='namespace'
                      value={namespace}
                      onChange={handleNamespaceChange}
                    >
                      {namespaceOptions[type].map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                    </FormControl>
                  ) : null
                )}
              {/* Name */}
              <FormControl>
                  Package Name
                <Stack direction='column' spacing={1}>
                  <Input
                    type='text'
                    mt={1.5}
                    value={purlName}
                    size='md'
                    onChange={handleNameChange}
                  />
                  <Progress value={nameProgressValue} colorScheme={getProgressColor(nameProgressValue)} />
                </Stack>
              </FormControl>
              {/* Version */}
              <FormControl>
                  Version
                <Stack direction='column' spacing={1}>
                  <Input
                    size='md'
                    mt={1.5}
                    type='text'
                    value={purlVersion}
                    onChange={handleVersionChange}
                  />
                  <Progress value={verProgressValue} colorScheme={getProgressColor(verProgressValue)} />
                </Stack>
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
