import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Flex, FormControl, FormLabel, Input, Alert, AlertIcon, AlertDescription, Checkbox, FormErrorMessage, Textarea, IconButton, Heading, Grid, GridItem } from '@chakra-ui/react'
import { useState } from 'react'
import { FaPlus } from 'react-icons/fa6'

const LegalModal = ({ data, isOpen, onClose }) => {

  const [orgName, setOrgName] = useState('')
  const [url, setUrl] = useState('')
  const [contacts, setContacts] = useState([])
  const [error, setError] = useState('')

  const handleCreate = (e) =>  {
    e.preventDefault()
    onClose()
  }
  const handleUpdate = (e) => {
    e.preventDefault()
    onClose()
  }

  const addRow = () => {
    setError('')
    const newId = contacts?.length + 1;
    setContacts([...contacts, { id: newId, name: '', email: '', phone: ''}]);
  }

  const handleChange = (value, id, field) => {
    setError('')
    const newData = contacts.map(item => {
      if (item.id === id) {
          return { ...item, [field]: value }
      }
      return item;
    });
    setContacts(newData);
  };

  return (
    <>
      <Modal size='4xl' isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <form onSubmit={data ? handleUpdate : handleCreate}>
          <ModalContent>
            <ModalHeader>{data ? 'Edit' : 'Add'} Manufacturer</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex width={'100%'} direction={'column'} gap={4}>
                {error !== '' && (
                  <Alert status='error' borderRadius={4}>
                    <AlertIcon />
                    <AlertDescription fontSize={'sm'} pr={2}>{error}</AlertDescription>
                  </Alert>
                )}
                <Grid templateColumns={`repeat(2,1fr)`} alignItems={'flex-start'} gap={4}>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Organization Name</FormLabel>
                      <Input type='text' value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl>
                      <FormLabel>URL</FormLabel>
                      <Input type='text' value={url} onChange={(e) => setUrl(e.target.value)} />
                    </FormControl>
                  </GridItem>
                </Grid>
                <Flex width={'100%'} my={2} justifyContent={'space-between'} alignItems={'center'}>
                  <Heading fontWeight={'medium'} fontFamily={'inherit'} fontSize={'md'}>Contacts</Heading>
                  <IconButton size='sm' colorScheme='blue' icon={<FaPlus />} onClick={addRow}/>
                </Flex>
                {contacts?.length > 0 && contacts?.map((item,index) => (
                  <Grid key={index} templateColumns={`repeat(3,1fr)`} alignItems={'flex-start'} gap={4}>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Name</FormLabel>
                        <Input type='text' value={item?.name} onChange={(e) => handleChange(e.target.value, item.id, 'name')} />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input type='email' value={item?.name} onChange={(e) => handleChange(e.target.value, item.id, 'email')} />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Phone</FormLabel>
                        <Input type='number' value={item?.name} onChange={(e) => handleChange(e.target.value, item.id, 'phone')} />
                      </FormControl>
                    </GridItem>
                  </Grid>
                ))}
              </Flex>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme='gray' mr={3} onClick={onClose}>Cancel</Button>
              <Button colorScheme='blue' type='submit'>{data ? 'Update' : 'Save'}</Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  )
}

export default LegalModal
