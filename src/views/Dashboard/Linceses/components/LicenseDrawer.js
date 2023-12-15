import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Checkbox,
  Text
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'

const LicenseDrawer = ({ isOpen, onClose, data }) => {
  const [name, setName] = useState('')
  const [spdxId, setSpdxId] = useState('')
  const [osi, setOsi] = useState(false)
  const [fsf, setFsf] = useState(false)
  const [isCustom, setIsCustom] = useState(false)
  const [licenseText, setLicenseText] = useState('')
  const [licenseComments, setLicenseComments] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (data) {
      setName(data.name)
      setSpdxId(data.licenseId)
      setOsi(data.isOsiApproved)
      setFsf(data.fsf)
      setIsCustom(data.custom)
      setStatus(data.status)
    }
  }, [data])

  return (
    <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='md'>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Add License</DrawerHeader>

        <DrawerBody>
          <Stack direction={'column'} spacing={4} alignItems={'flex-start'}>
            {/* NAME */}
            <FormControl isRequired>
              <FormLabel htmlFor='name'>Name</FormLabel>
              <Input
                name='name'
                id='name'
                fontSize={'sm'}
                value={name}
                placeholder='Add name'
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>
            {/* SPDX ID */}
            <FormControl>
              <FormLabel htmlFor='spdxId'>SPDX ID</FormLabel>
              <Input
                name='spdxId'
                id='spdxId'
                value={spdxId}
                fontSize={'sm'}
                placeholder='Add SPDX ID'
                onChange={(e) => setSpdxId(e.target.value)}
              />
            </FormControl>
            {/* LICENSE TEXT */}
            <FormControl>
              <FormLabel htmlFor='licenseText'>License Text</FormLabel>
              <Textarea
                name='licenseText'
                id='licenseText'
                rows={3}
                value={licenseText}
                fontSize={'sm'}
                placeholder='Add license text'
                onChange={(e) => setLicenseText(e.target.value)}
              />
            </FormControl>
            {/* LICENSE COMMENTS */}
            <FormControl>
              <FormLabel htmlFor='licenseComments'>License Comments</FormLabel>
              <Textarea
                name='licenseComments'
                id='licenseComments'
                rows={3}
                value={licenseComments}
                fontSize={'sm'}
                placeholder='Add license comments'
                onChange={(e) => setLicenseComments(e.target.value)}
              />
            </FormControl>
            {/* STATUS */}
            <FormControl>
              <FormLabel htmlFor='status'>Status</FormLabel>
              <Select
                fontSize={'sm'}
                name='status'
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value='' style={{ background: 'lightgray' }}>
                  -- Select --
                </option>
                <option value='approved'>Approved</option>
                <option value='rejected'>Rejected</option>
                <option value='unspecified'>Unspecified</option>
              </Select>
            </FormControl>
            {/* CHECKS */}
            <Stack spacing={3} direction={'column'}>
              <Checkbox
                size='md'
                colorScheme='blue'
                isChecked={osi}
                onChange={() => setOsi(!osi)}
                mt={3}
              >
                <Text fontSize='sm'>Open-Source License</Text>
              </Checkbox>
              <Checkbox
                size='md'
                colorScheme='blue'
                isChecked={fsf}
                onChange={() => setFsf(!fsf)}
              >
                <Text fontSize='sm'>Free Software Foundation</Text>
              </Checkbox>
              <Checkbox
                size='md'
                colorScheme='blue'
                isChecked={isCustom}
                onChange={() => setIsCustom(!isCustom)}
              >
                <Text fontSize='sm'>Custom</Text>
              </Checkbox>
            </Stack>
          </Stack>
        </DrawerBody>

        <DrawerFooter>
          <Button mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button variant='solid' colorScheme='blue' disabled={name === ''}>
            Save
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default LicenseDrawer
