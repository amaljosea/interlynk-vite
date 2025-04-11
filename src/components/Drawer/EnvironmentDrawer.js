import { useMutation } from '@apollo/client'
import { useMemo, useState } from 'react'
import { filterEnvList, getFullDate, isDefaultEnv, timeSince } from 'utils'
import ConfirmationModal from 'views/Dashboard/Products/components/ConfirmationModal'
import EnvModal from 'views/Dashboard/Products/components/EnvModal'

import { AddIcon, CheckCircleIcon } from '@chakra-ui/icons'
import {
  Flex,
  IconButton,
  Stack,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'

import DeleteButton from 'components/Icons/DeleteButton'
import LynkDrawer from 'components/LynkDrawer'
import LynkTable from 'components/LynkTable'

import { useThemeColor } from 'hooks/useThemeColors'

import { EnvDelete } from 'graphQL/Mutation'

const EnvironmentDrawer = ({
  data,
  isOpen,
  onClose,
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

  const { primaryBlueText } = useThemeColor(['primaryBlueText'])

  const handleDelete = async (id) => {
    setLoading(true)
    await projectDelete({
      variables: {
        id
      }
    }).then((res) => {
      if (res?.data) {
        if (id === activeEnv) {
          activeEnv = data?.projectGroup?.defaultProject?.id
          setActiveEnv(activeEnv)
        }

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
  }, [data?.projectGroup?.enabled, onProdOpen])

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
            {id === activeEnv && <CheckCircleIcon color={primaryBlueText} />}
          </Flex>
        )
      },
      wrap: true
    },
    // VERSION
    {
      id: 'VERSIONS',
      name: 'VERSIONS',
      selector: (row) => <Text>{row?.sboms?.length}</Text>,
      wrap: true
    },
    // CREATED AT
    {
      id: 'CREATEDAT',
      name: 'CREATED AT',
      selector: (row) => (
        <Tooltip label={getFullDate(row?.updatedAt)}>
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
        const { name } = row
        return (
          <DeleteButton
            variant={'solid'}
            size='xs'
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

  return (
    <>
      <LynkDrawer
        title={'Environments'}
        isOpen={isOpen}
        size='lg'
        onClose={onClose}
        noFooter
      >
        <Flex flexDir={'column'} width={'100%'}>
          <LynkTable
            subHeader
            columns={columns}
            data={
              data?.projectGroup
                ? filterEnvList(data?.projectGroup?.projects)
                : []
            }
            defaultSortFieldId={'NAME'}
            progressPending={data?.projectGroup ? false : true}
            subHeaderComponent={Header}
          />
        </Flex>
      </LynkDrawer>

      {/* ADD PROJECT */}
      {isProdOpen && (
        <EnvModal
          isOpen={isProdOpen}
          onClose={onProdClose}
          groupId={data?.projectGroup?.id}
        />
      )}

      {/* DELETE WARNING */}
      {
        <ConfirmationModal
          isOpen={isWarningOpen}
          onClose={onWarningClose}
          onConfirm={() => handleDelete(activeRow?.id)}
          isLoading={loading}
          name={activeRow?.name}
          title={`Delete ${activeRow?.name}`}
          description='Deleting this environment will:'
          items={[
            'remove the environment, included versions and SBOMs',
            'remove any external access to versions in this environment',
            'disable import of SBOM to this environment'
          ]}
        />
      }
    </>
  )
}

export default EnvironmentDrawer
