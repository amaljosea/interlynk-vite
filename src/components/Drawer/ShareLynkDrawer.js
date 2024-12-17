import { useQuery } from '@apollo/client'
import { useMemo } from 'react'
import DataTable from 'react-data-table-component'
import { customStyles, getFullDateAndTime, timeSince } from 'utils'
import { getShareLinklUrl } from 'utils/url'

import { Flex, IconButton, Input, Text, Tooltip } from '@chakra-ui/react'
import { useClipboard, useDisclosure } from '@chakra-ui/react'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import AddButton from 'components/Icons/AddButton'
import LynkAlert from 'components/LynkAlert'
import LynkSwitch from 'components/Misc/LynkSwitch'
import CreateSharelynk from 'components/Modal/CreateSharelynk'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetSharelynks } from 'graphQL/Queries'

import { FaCheck, FaRegCopy } from 'react-icons/fa6'
import { PiFileSvgDuotone } from 'react-icons/pi'

const ShareLynkDrawer = ({ isOpen, onClose, groupId }) => {
  const { showToast } = useCustomToast()
  const BACKEND_URL = process.env.REACT_APP_SERVER

  const { headingTextColor, primaryTextColor } = useThemeColor([
    'headingTextColor',
    'primaryTextColor'
  ])

  const defaultDate = new Date()
  defaultDate.setDate(defaultDate.getDate() + 90)

  const { data, error, loading } = useQuery(GetSharelynks, {
    skip: isOpen ? false : true,
    fetchPolicy: 'network-only',
    variables: {
      ids: [groupId]
    }
  })
  const { nodes } = data?.shareLynks || ''

  const SHARELYNK = useDisclosure()

  const svgLink = useClipboard(
    `${BACKEND_URL}/api/v1/badges?type=hcard&project_group_id=${groupId}`
  )

  // HEADER SECTION
  const subHeader = useMemo(() => {
    const icon = svgLink.hasCopied ? (
      <FaCheck />
    ) : (
      <PiFileSvgDuotone size={26} />
    )
    const onCopySvg = () => {
      svgLink.onCopy()
      showToast({ description: 'SVG link copied' })
    }
    return (
      <Flex
        gap={2}
        width={'100%'}
        alignItems={'center'}
        justifyContent={'flex-end'}
      >
        {nodes?.length > 0 && (
          <Tooltip label='SVG Link' placement='left'>
            <IconButton
              icon={icon}
              onClick={onCopySvg}
              colorScheme={svgLink.hasCopied ? 'whatsapp' : 'blue'}
            />
          </Tooltip>
        )}
        <AddButton
          label='Add ShareLynk'
          tooltipPlacement='left'
          onClick={SHARELYNK.onOpen}
        />
      </Flex>
    )
  }, [svgLink, nodes?.length, SHARELYNK.onOpen, showToast])

  // COLUMNS
  const columns = [
    // STATUS
    {
      id: 'ENABLED',
      name: 'ACTIVE',
      selector: (row) => (
        <LynkSwitch size='md' isChecked={row?.enabled} isReadOnly />
      ),
      width: '15%'
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
      width: '60%',
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
                data={nodes || []}
                progressPending={loading}
                subHeaderComponent={subHeader}
                progressComponent={<CustomLoader />}
                customStyles={customStyles(headingTextColor)}
              />
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {SHARELYNK.isOpen && (
        <CreateSharelynk
          groupId={groupId}
          defaultDate={defaultDate}
          isOpen={SHARELYNK.isOpen}
          onClose={SHARELYNK.onClose}
        />
      )}
    </>
  )
}

export default ShareLynkDrawer
