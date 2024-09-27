import { useQuery } from '@apollo/client'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getFullDateAndTime, timeSince, truncatedValue } from 'utils'

import {
  ButtonGroup,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  Stack,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import ArchiveSbom from 'components/Modal/ArchiveSbom'

import useCustomToast from 'hooks/useCustomToast'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetArchivedVersions, GetVersions } from 'graphQL/Queries'

import { FaEye } from 'react-icons/fa6'
import { MdOutlineUnarchive } from 'react-icons/md'

const ArchivedVersions = ({ isOpen, onClose, projectGroup }) => {
  const navigate = useNavigate()
  const { showToast } = useCustomToast()
  const { generateProductVersionDetailPageUrlFromCurrentUrl } =
    useProductUrlContext()
  const params = useParams()
  const productId = params?.productid
  const { primaryTextColor } = useThemeColor(['primaryTextColor'])
  const [activeRow, setActiveRow] = useState(null)

  const { data: versions } = useQuery(GetVersions, {
    skip: isOpen ? false : true,
    variables: {
      id: productId,
      first: 100,
      direction: 'DESC',
      field: 'SBOMS_CREATED_AT'
    }
  })

  const { nodes } = versions?.project?.sbomVersions || ''

  const { data, loading } = useQuery(GetArchivedVersions, {
    skip: isOpen ? false : true,
    variables: { id: productId }
  })

  const { sbomArchived } = data?.project || ''

  const {
    isOpen: isWarnOpen,
    onOpen: onWarnOpen,
    onClose: onWarnClose
  } = useDisclosure()

  const onRestore = (row) => {
    const isExists = nodes?.some(
      (item) => item?.projectVersion === row?.projectVersion
    )
    if (isExists) {
      showToast({
        title: 'Restore Version',
        description:
          'An existing version with same value found. Please delete previous version to restore this one.',
        status: 'info'
      })
    } else {
      setActiveRow(row)
      onWarnOpen()
    }
  }

  const onView = (row) => {
    const link = generateProductVersionDetailPageUrlFromCurrentUrl({
      sbomid: row?.id,
      paramsObj: {
        tab: 'general'
      }
    })
    navigate(link)
  }

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
            {loading ? (
              <CustomLoader />
            ) : (
              <Flex my={2} flexDir={'column'} alignItems={'flex-start'} gap={5}>
                {sbomArchived?.map((item, index) => (
                  <Flex
                    w={'full'}
                    key={index}
                    alignItems={'flex-start'}
                    justifyContent={'space-between'}
                  >
                    <Stack spacing={0}>
                      <Text>
                        {truncatedValue(item?.project?.projectGroup?.name, 20)}{' '}
                        : {truncatedValue(item?.projectVersion, 20)}
                      </Text>
                      <Tooltip
                        label={getFullDateAndTime(item?.createdAt)}
                        placement='top'
                      >
                        <Text color={'gray.500'} fontSize={'sm'}>
                          Last updated {timeSince(item?.createdAt)}
                        </Text>
                      </Tooltip>
                    </Stack>
                    <ButtonGroup>
                      <Tooltip label='View' placement='top'>
                        <IconButton
                          variant='outline'
                          onClick={() => onView(item)}
                          icon={<FaEye size={16} color={primaryTextColor} />}
                        />
                      </Tooltip>
                      <Tooltip label='Restore' placement='top'>
                        <IconButton
                          variant='outline'
                          onClick={() => onRestore(item)}
                          icon={
                            <MdOutlineUnarchive
                              size={20}
                              color={primaryTextColor}
                            />
                          }
                        />
                      </Tooltip>
                    </ButtonGroup>
                  </Flex>
                ))}
              </Flex>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* ARCHIVE VERSION */}
      {isWarnOpen && (
        <ArchiveSbom
          data={activeRow}
          isOpen={isWarnOpen}
          onClose={onWarnClose}
          projectGroup={projectGroup}
        />
      )}
    </>
  )
}

export default ArchivedVersions
