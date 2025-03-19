import { useMutation } from '@apollo/client'
import { useState } from 'react'
import DataTable from 'react-data-table-component'
import { customStyles } from 'utils/styleUtils'

import { Stack, Text } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import LynkDrawer from 'components/LynkDrawer'
import Pagination from 'components/Pagination'

import useCustomToast from 'hooks/useCustomToast'
import { usePaginatedQuery } from 'hooks/usePaginatedQuery'
import { useThemeColor } from 'hooks/useThemeColors'

import { BitbucketRepositoryBulkImport } from 'graphQL/Mutation'
import { BitbucketRepositories } from 'graphQL/Queries'

const BitbucketProjects = ({ isOpen, onClose }) => {
  const { showToast } = useCustomToast()
  const { primaryTextColor, headingTextColor, secondaryTextColor } =
    useThemeColor([
      'primaryTextColor',
      'headingTextColor',
      'secondaryTextColor'
    ])

  const [importProject, { loading: importLoading }] = useMutation(
    BitbucketRepositoryBulkImport
  )
  const { nodes, loading, paginationProps } = usePaginatedQuery(
    BitbucketRepositories,
    {
      skip: isOpen ? false : true,
      selector: 'bitbucketApiRepositories'
    }
  )

  const [toggleClear, setToggleClear] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState([])

  const handleSelect = (state) => {
    setSelectedRepo(state?.selectedRows?.map((item) => item?.uuid))
  }

  const repositories = nodes
    ?.filter((repo) => selectedRepo?.includes(repo?.uuid))
    ?.map((item) => ({
      uuid: item?.uuid,
      name: item?.name,
      fullName: item?.fullName,
      slug: item?.slug,
      workspace: item?.workspace,
      mainbranch: item?.mainbranch
    }))

  const handleSubmit = () => {
    importProject({ variables: { input: { repositories: repositories } } })
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
      .finally(() => {
        setToggleClear(true)
        onClose()
      })
  }

  const columns = [
    {
      id: 'REPOSITORIES',
      name: 'REPOSITORIES',
      compact: true,
      selector: (row) => {
        const { mainbranch, name } = row || ''
        return (
          <Stack my={3} spacing={1}>
            <Text color={primaryTextColor}>{name}</Text>
            <Text fontSize='sm' color={secondaryTextColor}>
              {mainbranch}
            </Text>
          </Stack>
        )
      },
      wrap: true
    }
  ]

  return (
    <LynkDrawer
      isOpen={isOpen}
      onClose={onClose}
      buttonLabel={'Import'}
      onSubmit={handleSubmit}
      isLoading={importLoading}
      title={'Import Bitbucket Projects'}
      isDisabled={repositories?.length === 0}
    >
      <Stack spacing={4} overflowY={'scroll'}>
        <DataTable
          responsive
          selectableRows
          persistTableHead
          columns={columns}
          data={nodes || []}
          progressPending={loading}
          clearSelectedRows={toggleClear}
          className='data-table-container'
          onSelectedRowsChange={handleSelect}
          progressComponent={<CustomLoader />}
          customStyles={customStyles(headingTextColor)}
        />
        <Pagination {...paginationProps} />
      </Stack>
    </LynkDrawer>
  )
}

export default BitbucketProjects
