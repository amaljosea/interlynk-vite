import { useState } from 'react'
import DataTable from 'react-data-table-component'
import { customStyles, getFullDateAndTime, timeSince } from 'utils'

import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  IconButton,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import ArchiveSbom from 'components/Modal/ArchiveSbom'

import { MdOutlineUnarchive } from 'react-icons/md'

const ArchivedVersions = ({ data, isOpen, onClose, refetch }) => {
  const headColor = useColorModeValue('#4A5568', '#CBD5E0')
  const textColor = useColorModeValue('#1A202C', '#F7FAFC')
  const [activeRow, setActiveRow] = useState(null)

  const nodes = data?.filter((item) => item?.lifecycle === 'archived')

  const {
    isOpen: isWarnOpen,
    onOpen: onWarnOpen,
    onClose: onWarnClose
  } = useDisclosure()

  const onRestore = (row) => {
    setActiveRow(row)
    onWarnOpen()
  }

  const columns = [
    // VERSION
    {
      id: 'SBOMS_PROJECT_VERSION',
      name: 'VERSION',
      selector: (row) => {
        const { projectVersion } = row
        return (
          <Text color={textColor} fontSize={14}>
            {projectVersion}
          </Text>
        )
      },
      wrap: true
    },
    // CREATED AT
    {
      id: 'SBOMS_CREATED_AT',
      name: 'UPLOADED',
      selector: (row) => {
        const { createdAt } = row
        return (
          <Tooltip label={getFullDateAndTime(createdAt)} placement='top'>
            <Text color={textColor} textAlign={'right'}>
              {timeSince(createdAt)}
            </Text>
          </Tooltip>
        )
      },
      right: 'true'
    },
    // ACTIONS
    {
      id: 'ACTION',
      name: 'ACTION',
      selector: (row) => {
        return (
          <Tooltip label='Restore' placement='top'>
            <IconButton
              size='xs'
              onClick={() => onRestore(row)}
              icon={<MdOutlineUnarchive size={20} color={textColor} />}
            />
          </Tooltip>
        )
      },
      right: 'true'
    }
  ]

  return (
    <>
      <Drawer
        size='md'
        isOpen={isOpen}
        placement='right'
        onClose={onClose}
        closeOnOverlayClick={false}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton mt={2} />
          <DrawerHeader borderBottomWidth='1px'>Archived Versions</DrawerHeader>
          <DrawerBody>
            <Box height={'85%'} overflowY={'scroll'}>
              <DataTable
                responsive
                columns={columns}
                data={nodes || []}
                customStyles={customStyles(headColor)}
                persistTableHead
              />
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* ARCHIVE VERSION */}
      {isWarnOpen && (
        <ArchiveSbom
          data={activeRow}
          refetch={refetch}
          isOpen={isWarnOpen}
          onClose={onWarnClose}
        />
      )}
    </>
  )
}

export default ArchivedVersions
