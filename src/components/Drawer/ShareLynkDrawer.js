import { useMutation } from '@apollo/client'
import { useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { customStyles, getFullDateAndTime, timeSince } from 'utils'
import { getShareLinklUrl } from 'utils/url'

import {
  Checkbox,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Input,
  Text,
  Tooltip,
  useClipboard,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import AddButton from 'components/Icons/AddButton'
import LynkAlert from 'components/LynkAlert'
import LynkDate from 'components/LynkDate'
import LynkModal from 'components/LynkModal'
import LynkSwitch from 'components/Misc/LynkSwitch'

import { useThemeColor } from 'hooks/useThemeColors'

import { CreateShareLynk } from 'graphQL/Mutation'

import { BiShare } from 'react-icons/bi'
import { FaCheck, FaRegCopy } from 'react-icons/fa6'
import { PiFileSvgDuotone } from 'react-icons/pi'

const ShareLynkDrawer = ({ error, isOpen, onClose, data, groupId }) => {
  const BACKEND_URL = process.env.REACT_APP_SERVER
  const [createLynk] = useMutation(CreateShareLynk)

  const { headingTextColor, primaryTextColor } = useThemeColor([
    'headingTextColor',
    'primaryTextColor'
  ])

  const defaultDate = new Date()
  defaultDate.setDate(defaultDate.getDate() + 90)

  const {
    isOpen: isShareLykOpen,
    onOpen: onShareLynkOpen,
    onClose: onShareLynkClose
  } = useDisclosure()
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
        onShareLynkClose()
      }
    })
    setSelectedDate('')
    setNoExpire(false)
  }

  const svgLink = useClipboard(
    `${BACKEND_URL}/api/v1/badges?type=hcard&project_group_id=${groupId}`
  )

  // HEADER SECTION
  const subHeader = useMemo(() => {
    return (
      <Flex
        width={'100%'}
        alignItems={'center'}
        justifyContent={'flex-end'}
        gap={2}
      >
        {data?.nodes?.length > 0 && (
          <Tooltip label='SVG Link' placement='left'>
            <IconButton
              onClick={() => svgLink.onCopy()}
              colorScheme={svgLink.hasCopied ? 'whatsapp' : 'blue'}
              icon={
                svgLink.hasCopied ? <FaCheck /> : <PiFileSvgDuotone size={26} />
              }
            />
          </Tooltip>
        )}
        <AddButton
          label='Add ShareLynk'
          tooltipPlacement='left'
          onClick={onShareLynkOpen}
        />
      </Flex>
    )
  }, [svgLink, onShareLynkOpen, data])

  // COLUMNS
  const columns = [
    // STATUS
    {
      id: 'ENABLED',
      name: 'ACTIVE',
      selector: (row) => (
        <LynkSwitch size='md' isChecked={row?.enabled} isReadOnly />
      ),
      width: '90px'
    },
    // URL
    {
      id: 'SIGNED_URL',
      name: 'LINK',
      selector: (row) => {
        const { enabled, contents } = row
        const projectGroup = contents[0]
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const sbomLink = useClipboard(
          getShareLinklUrl({
            signedUrlParams: row?.signedUrlParams,
            productgroupid: projectGroup.id,
            productid: projectGroup.defaultProject.id
          })
        )
        return (
          <Flex my={2} gap={2} alignItems={'center'}>
            <Input
              size='sm'
              color={primaryTextColor}
              value={sbomLink.value}
              onChange={(e) => sbomLink.setValue(e.target.value)}
              width={'350px'}
              isReadOnly
              pointerEvents={'none'}
              fontSize={'sm'}
            />
            <IconButton
              isDisabled={!enabled}
              size='sm'
              onClick={() => sbomLink.onCopy()}
              colorScheme={sbomLink?.hasCopied ? 'whatsapp' : 'blue'}
              icon={sbomLink?.hasCopied ? <FaCheck /> : <FaRegCopy />}
            />
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
          <Text color={primaryTextColor} textAlign={'right'}>
            {timeSince(row?.updatedAt)}
          </Text>
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
              <LynkAlert msg={error?.message || 'Something went wrong'} />
            ) : (
              <DataTable
                subHeader
                persistTableHead
                responsive={true}
                columns={columns}
                data={data?.nodes || []}
                customStyles={customStyles(headingTextColor)}
                progressPending={data ? false : true}
                progressComponent={<CustomLoader />}
                subHeaderComponent={subHeader}
              />
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {isShareLykOpen && (
        <LynkModal
          isOpen={isShareLykOpen}
          onClose={onShareLynkClose}
          onSubmit={handleCreateLynk}
          title={'Create ShareLynk'}
          Icon={BiShare}
          disabled={
            (selectedDate !== '' && !isValidDate) ||
            (!selectedDate && noExpire === false)
          }
          buttonText={'Add'}
        >
          {!noExpire && (
            <FormControl mb={3} isInvalid={!isValidDate}>
              <FormLabel mb={1} htmlFor='expire'>
                Expiration Date
              </FormLabel>
              <LynkDate value={selectedDate} onChange={handleDateChange} />
              {!isValidDate && (
                <FormErrorMessage>
                  Please enter a valid expiry date
                </FormErrorMessage>
              )}
            </FormControl>
          )}
          <FormControl mb={3}>
            <Checkbox isChecked={noExpire} onChange={handleExpireChange}>
              No Expiration
            </Checkbox>
          </FormControl>
        </LynkModal>
      )}
    </>
  )
}

export default ShareLynkDrawer
