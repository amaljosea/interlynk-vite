import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'

import { Checkbox, List, ListItem, Stack, Text } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import { BitbucketRepositoryBulkImport } from 'graphQL/Mutation'
import { BitbucketRepositories } from 'graphQL/Queries'

import { FaBitbucket } from 'react-icons/fa6'

const BitbucketProjects = ({ isOpen, onClose }) => {
  const { showToast } = useCustomToast()
  const { secondaryTextColor } = useThemeColor(['secondaryTextColor'])

  const [importProject, { loading: importLoading }] = useMutation(
    BitbucketRepositoryBulkImport
  )
  const { data, loading } = useQuery(BitbucketRepositories, {
    skip: isOpen ? false : true
  })

  const { edges } = data?.bitbucketApiRepositories || {}

  const [selected, setSelected] = useState([])
  const [isAllSelected, setIsAllSelected] = useState(false)

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelected([])
    } else {
      setSelected(edges?.map((item) => item?.node?.uuid))
    }
    setIsAllSelected(!isAllSelected)
  }

  const selectedRepositories = edges
    ?.filter((repo) => selected?.includes(repo?.node?.uuid))
    ?.map((item) => ({
      uuid: item?.node?.uuid,
      name: item?.node?.name,
      fullName: item?.node?.fullName,
      slug: item?.node?.slug,
      workspace: item?.node?.workspace,
      mainbranch: item?.node?.mainbranch
    }))

  const handleSubmit = () => {
    if (selectedRepositories?.length > 0) {
      importProject({
        variables: { input: { repositories: selectedRepositories } }
      })
        .then((res) => {
          if (res?.data?.bitbucketRepositoryBulkImport?.errors?.length > 0) {
            showToast({
              description: res?.data?.bitbucketRepositoryBulkImport?.errors[0],
              status: 'error'
            })
          } else {
            showToast({
              title: 'Data imported successfully',
              description:
                'Projects will be available shortly. Please refresh to update the products.',
              status: 'success'
            })
          }
        })
        .finally(() => onClose())
    } else {
      showToast({
        description: 'Please select atleast 1 project',
        status: 'error'
      })
    }
  }

  useEffect(() => {
    setIsAllSelected(selected.length === edges?.length && edges?.length > 0)
  }, [edges?.length, selected])

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      Icon={FaBitbucket}
      buttonText={'Save'}
      onSubmit={handleSubmit}
      isLoading={importLoading}
      title={'Add BitBucket Projects'}
    >
      {loading ? (
        <CustomLoader />
      ) : (
        <Stack>
          <Checkbox isChecked={isAllSelected} onChange={handleSelectAll}>
            Select All
          </Checkbox>
          <List spacing={2}>
            {edges.map((item) => (
              <ListItem
                p={3}
                display='flex'
                borderWidth={1}
                borderRadius='md'
                alignItems='center'
                key={item?.node?.uuid}
                justifyContent='space-between'
              >
                <Stack spacing={0}>
                  <Checkbox
                    isChecked={selected.includes(item?.node?.uuid)}
                    onChange={() => handleSelect(item?.node?.uuid)}
                  >
                    {item?.node?.name}
                  </Checkbox>
                  <Checkbox
                    pl={6}
                    size='sm'
                    isReadOnly
                    fontSize={'sm'}
                    color={secondaryTextColor}
                    defaultChecked={item?.node?.isImported}
                  >
                    Import SBOM
                  </Checkbox>
                </Stack>
                <Text fontSize='sm' color={secondaryTextColor}>
                  {item?.node?.mainbranch}
                </Text>
              </ListItem>
            ))}
          </List>
        </Stack>
      )}
    </LynkModal>
  )
}

export default BitbucketProjects
