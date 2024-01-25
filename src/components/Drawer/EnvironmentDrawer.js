import { AddIcon, CheckCircleIcon, DeleteIcon } from '@chakra-ui/icons'
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Flex,
  Tooltip,
  IconButton,
  Stack,
  useDisclosure,
  UnorderedList,
  ListItem
} from '@chakra-ui/react'
import {
  timeSince,
  customStyles,
  getFullDateAndTime,
  isDefaultEnv,
  removeDuplicates,
  filterEnvList
} from 'utils'
import CustomLoader from 'components/CustomLoader'
import DataTable from 'react-data-table-component'
import { useMemo, useState } from 'react'
import EnvModal from 'views/Dashboard/Products/components/EnvModal'
import { useMutation } from '@apollo/client'
import { EnvDelete } from 'graphQL/Mutation'

const EnvironmentDrawer = ({
  data,
  isOpen,
  onClose,
  refetch,
  activeEnv,
  setActiveEnv
}) => {
  const {
    isOpen: isProdOpen,
    onOpen: onProdOpen,
    onClose: onProdClose
  } = useDisclosure()

  const {
    isOpen: isWarningOpen,
    onOpen: onWarningOpen,
    onClose: onWarningClose
  } = useDisclosure()

  const [activeRow, setActiveRow] = useState(null)
  const [loading, setLoading] = useState(false)

  const [projectDelete] = useMutation(EnvDelete)

  const handleDelete = async (id) => {
    setLoading(true)
    await projectDelete({
      variables: {
        id
      }
    }).then((res) => {
      if (res?.data) {
        if (id === activeEnv) {
          setActiveEnv(data?.projectGroup?.defaultProject?.id)
        }
        refetch({
          id: data?.projectGroup?.id
        })
        setTimeout(() => {
          setLoading(false)
          onWarningClose()
        }, 1000)
      }
    })
  }

  // TABLE HEADER
  const Header = useMemo(() => {
    return (
      <Flex width={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
        <Stack direction={'row'} spacing={2} alignItems={'center'}>
          {/* ADD ENV */}
          <Tooltip label='Add Environment' placement='left'>
            <IconButton
              icon={<AddIcon />}
              colorScheme='blue'
              variant='solid'
              isDisabled={!data?.projectGroup?.enabled}
              onClick={() => {
                onProdOpen()
              }}
            />
          </Tooltip>
        </Stack>
      </Flex>
    )
  }, [])

  // COLUMNS
  const columns = [
    // NAME
    {
      id: 'NAME',
      name: 'NAME',
      selector: (row) => {
        const { id, name } = row
        return (
          <Flex flexDir={'row'} gap={2} alignItems={'flex-start'}>
            <Text textTransform={isDefaultEnv(name) ? 'capitalize' : 'none'}>
              {name}
            </Text>
            {id === activeEnv && <CheckCircleIcon color={'blue.500'} />}
          </Flex>
        )
      },
      wrap: true
    },
    // VERSION
    {
      id: 'VERSIONS',
      name: 'VERSIONS',
      selector: (row) => <Text>{removeDuplicates(row?.sboms)?.length}</Text>,
      wrap: true
    },
    // CREATED AT
    {
      id: 'CREATEDAT',
      name: 'CREATED AT',
      selector: (row) => (
        <Tooltip label={getFullDateAndTime(row?.updatedAt)}>
          <Text>{timeSince(row?.updatedAt)}</Text>
        </Tooltip>
      ),
      wrap: true
    },
    // ACTIONS
    {
      id: 'ACTIONS',
      name: 'ACTIONS',
      selector: (row) => {
        const { name, id } = row
        return (
          <IconButton
            size='xs'
            icon={<DeleteIcon />}
            colorScheme='red'
            variant='solid'
            isDisabled={isDefaultEnv(name)}
            onClick={() => {
              setActiveRow(row)
              onWarningOpen()
            }}
          />
        )
      },
      wrap: true
    }
  ]

  const conditionalRowStyles = [
    {
      when: (row) => row.name === 'production',
      style: {
        borderBottom: '1px solid darkgray'
      }
    }
  ]

  return (
    <>
      <Drawer isOpen={isOpen} placement='right' size='lg' onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Environments</DrawerHeader>
          <DrawerBody>
            <Flex flexDir={'column'} width={'100%'}>
              <DataTable
                columns={columns}
                data={
                  data?.projectGroup
                    ? filterEnvList(data?.projectGroup?.projects)
                    : []
                }
                customStyles={customStyles}
                defaultSortAsc
                defaultSortFieldId={'NAME'}
                progressPending={data?.projectGroup ? false : true}
                progressComponent={<CustomLoader />}
                subHeader
                subHeaderComponent={Header}
                persistTableHead
                responsive={true}
                conditionalRowStyles={conditionalRowStyles}
              />
            </Flex>
          </DrawerBody>

          <DrawerFooter display={'none'}>
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme='blue'>Save</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* ADD PROJECT */}
      {isProdOpen && (
        <EnvModal
          isOpen={isProdOpen}
          onClose={onProdClose}
          groupId={data?.projectGroup?.id}
          refetch={refetch}
        />
      )}

      {/* DELETE WARNING */}
      {isWarningOpen && activeRow && (
        <Modal isOpen={isWarningOpen} onClose={onWarningClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete {activeRow?.name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>Deleting this environment will: </Text>
              <UnorderedList>
                <Flex flexDir={'column'} gap={1} mt={4}>
                  {[
                    'remove the environment, included versions and SBOMs',
                    'remove any external access to versions in this environment',
                    'disable import of SBOM to this environment'
                  ].map((item, index) => (
                    <ListItem key={index}>{item}</ListItem>
                  ))}
                </Flex>
              </UnorderedList>
              <Text mt={10}>Are you sure you wish to continue?</Text>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={onWarningClose}>
                Cancel
              </Button>
              <Button
                colorScheme='red'
                isLoading={loading}
                loadingText='Deleting...'
                onClick={() => handleDelete(activeRow?.id)}
              >
                Ok
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default EnvironmentDrawer
