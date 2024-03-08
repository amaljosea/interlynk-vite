import { Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Tooltip, Text, Switch, Flex, IconButton, useDisclosure, Button, FormControl, FormLabel, FormErrorMessage, Input, useClipboard, Alert, Checkbox } from '@chakra-ui/react'
import CustomLoader from 'components/CustomLoader'
import { useMemo, useState } from 'react'
import { PiFileSvgDuotone } from 'react-icons/pi'
import DataTable from 'react-data-table-component'
import { FaCheck, FaPlus, FaRegCopy } from 'react-icons/fa6'
import { timeSince, getFullDateAndTime, customStyles } from 'utils'
import Datetime from 'react-datetime'
import 'react-datetime/css/react-datetime.css'
import { useMutation } from '@apollo/client'
import { CreateShareLynk } from 'graphQL/Mutation'

const ShareLynkDrawer = ({ error, isOpen, onClose, data, groupId, refetch }) => {
  const domain = window.location.origin
  const BACKEND_URL = process.env.REACT_APP_SERVER
  const [createLynk] = useMutation(CreateShareLynk)

  const defaultDate = new Date()
  defaultDate.setDate(defaultDate.getDate() + 90)

  const { isOpen: isShareLykOpen, onOpen: onShareLynkOpen, onClose: onShareLynkClose } = useDisclosure()
  const [selectedDate, setSelectedDate] = useState(null)
  const [isValidDate, setIsValidDate] = useState(true)
  const [noExpire, setNoExpire] = useState(false)

  const handleDateChange = (newDate) => {
    const currentDate = new Date()
    const isValidDate = newDate && !isNaN(newDate) && newDate?._d > currentDate
    setSelectedDate(newDate._d)
    if (isValidDate) {
      setIsValidDate(true)
    } else {
      if (typeof newDate === 'string' && newDate === '') {
        setIsValidDate(true)
      } else {
        setIsValidDate(false)
      }
    }
  }

  const handleExpireChange = (e) => {
    const { checked } = e.target
    setNoExpire(checked)
    setIsValidDate(true)
    if (checked === true) {
      setSelectedDate('')
    } else {
      setSelectedDate(defaultDate)
    }
  }

  const handleCreateLynk = () => {
    createLynk({
      variables: {
        enabled: true,
        id: [groupId],
        expiresAt: noExpire ? undefined : new Date(selectedDate).toISOString()
      }
    }).then((res) => {
      if (res?.data) {
        refetch()
        onShareLynkClose()
      }
    })
    setSelectedDate('')
    setNoExpire(false)
  }

  const svgLink = useClipboard(`${BACKEND_URL}/api/v1/badges?type=hcard&project_group_id=${groupId}`)

  // HEADER SECTION
  const subHeader = useMemo(() => {
    return (
      <Flex width={'100%'} alignItems={'center'} justifyContent={'flex-end'} gap={2}>
        {data?.nodes?.length > 0 && (
          <Tooltip label='SVG Link' placement='left'>
            <IconButton onClick={() => svgLink.onCopy()} colorScheme={svgLink.hasCopied ? 'whatsapp' : 'blue'} icon={svgLink.hasCopied ? <FaCheck /> : <PiFileSvgDuotone size={26} />} />
          </Tooltip>
        )}
        <Tooltip label='Add ShareLynk' placement='left'>
          <IconButton colorScheme='blue' icon={<FaPlus />} onClick={onShareLynkOpen}/>
        </Tooltip>
      </Flex>
    )
  }, [svgLink, onShareLynkOpen])

  // COLUMNS
  const columns = [
    // STATUS
    {
      id: 'ENABLED',
      name: 'ACTIVE',
      selector: (row) => {
        return <Switch size='md' isChecked={row?.enabled} isReadOnly />
      },
      width: '90px'
    },
    // URL
    {
      id: 'SIGNED_URL',
      name: 'LINK',
      selector: (row) => {
        const { enabled, contents } = row
        const sbomLink = useClipboard(
          `${domain}/customer/products?id=${contents[0]?.id}&signed_url_params=${row?.signedUrlParams}`
        )
        return (
          <Flex my={2} gap={2} alignItems={'center'}>
            <Input size='sm' value={sbomLink.value} onChange={(e) => sbomLink.setValue(e.target.value)} width={'350px'} isReadOnly pointerEvents={'none'} fontSize={'sm'} />
            <IconButton isDisabled={!enabled} size='sm' onClick={() => sbomLink.onCopy()} colorScheme={sbomLink.hasCopied ? 'whatsapp' : 'gray'} icon={sbomLink.hasCopied ? <FaCheck /> : <FaRegCopy />}/>
          </Flex>
        )
      },
      width: '350px',
      wrap: true
    },
    // UPDATED AT
    {
      id: 'UPDATED_AT',
      name: 'UPDATED',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row?.updatedAt)} placement={'top'}>
          <Text textAlign={'right'}>{timeSince(row?.updatedAt)}</Text>
        </Tooltip>
      ),
      sortable: true,
      sortFunction: (a, b) => {
        const dateA = new Date(a.updatedAt)
        const dateB = new Date(b.updatedAt)
        return dateA - dateB // Sort in descending order
      },
      right: 'true',
      wrap: true
    }
  ]

  return (
    <>
      <Drawer size='lg' isOpen={isOpen} placement='right' onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>ShareLynks</DrawerHeader>
          <DrawerBody>
            {error ? (
              <Alert status='error'>
                <Text wordBreak={'break-all'}>
                  {error?.message || 'Something went wrong'}
                </Text>
              </Alert>
            ) : (
              <DataTable
                subHeader
                persistTableHead
                responsive={true}
                columns={columns}
                data={data && data.nodes}
                customStyles={customStyles}
                progressPending={data ? false : true}
                progressComponent={<CustomLoader />}
                subHeaderComponent={subHeader}
              />
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {isShareLykOpen && (
        <Modal isOpen={isShareLykOpen} onClose={onShareLynkClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create ShareLynk</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {!noExpire && (
                <FormControl mb={3} isInvalid={!isValidDate}>
                  <FormLabel mb={1} htmlFor='expire'>Expiration Date</FormLabel>
                  <Datetime
                    value={selectedDate}
                    onChange={handleDateChange}
                    inputProps={{
                      placeholder: 'Select Date and Time',
                      onCopy: (e) => e.preventDefault(),
                      onPaste: (e) => e.preventDefault()
                    }}
                  />
                  {!isValidDate && (
                    <FormErrorMessage>
                      Please enter a valid expiry date
                    </FormErrorMessage>
                  )}
                </FormControl>
              )}
              <FormControl mb={3}>
                <Checkbox isChecked={noExpire} onChange={handleExpireChange}>No Expiration</Checkbox>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} fontSize={'sm'} onClick={onClose}>
                Close
              </Button>
              <Button fontSize={'sm'} variant='solid' colorScheme='blue' isDisabled={(selectedDate !== '' && !isValidDate) || (!selectedDate && noExpire === false)} onClick={handleCreateLynk}>
                Add
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default ShareLynkDrawer
