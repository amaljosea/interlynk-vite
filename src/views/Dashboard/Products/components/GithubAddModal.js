import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'

import {
  Box,
  Checkbox,
  Flex,
  Skeleton,
  Spinner,
  Text,
  useColorModeValue
} from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import { useThemeColor } from 'hooks/useThemeColors'

import { CreateProjectGroup } from 'graphQL/Mutation'

import { FaCodeBranch, FaGithub } from 'react-icons/fa'

const projects = [
  {
    name: 'sbomqs',
    label: 'Detected SBOM in releases',
    checkboxLabel: 'Import SBOM',
    loadTime: 3456
  },
  {
    name: 'sbomex',
    label: 'Detected SBOM in releases',
    checkboxLabel: 'Import SBOM',
    loadTime: 7654
  },
  {
    name: 'sbomgr',
    label: 'Detected SBOM in releases',
    checkboxLabel: 'Import SBOM',
    loadTime: 7653
  },
  {
    name: 'sbomasm',
    label: 'Detected SBOM in releases',
    checkboxLabel: 'Import SBOM',
    loadTime: 4567
  },
  {
    name: 'sbom_zen',
    label: 'Detected packages',
    checkboxLabel: 'Build Package SBOM',
    loadTime: 6524
  },
  {
    name: 'lynk-api',
    label: 'No SBOM detected',
    checkboxLabel: 'Build Source SBOM',
    loadTime: 3568
  },
  {
    name: 'lynk-dash-app',
    label: 'No SBOM detected',
    checkboxLabel: 'Build Source SBOM',
    loadTime: 3444
  },
  {
    name: 'lynk-iac',
    label: 'Not a source repository.',
    checkboxLabel: '',
    loadTime: 5342
  }
]

const GithubAddModal = ({ isOpen, onClose }) => {
  const [initialLoading, setInitialLoading] = useState(true)
  const [projectLoading, setProjectLoading] = useState({})
  const [buttonLoading, setButtonLoading] = useState(false)
  const [selectedProjects, setSelectedProjects] = useState({})
  const [selectAll, setSelectAll] = useState(false)
  const [importOptions, setImportOptions] = useState({})
  const [projectGroupCreate] = useMutation(CreateProjectGroup)

  const { primaryTextColor } = useThemeColor(['primaryTextColor'])
  const labelColor = useColorModeValue('#718096', '#A0AEC0')

  useEffect(() => {
    if (isOpen) {
      setInitialLoading(true)
      setSelectedProjects({})
      setImportOptions({})
      const timer = setTimeout(() => {
        setInitialLoading(false)
        projects.forEach((project) => {
          setProjectLoading((prev) => ({ ...prev, [project.name]: true }))
          setTimeout(() => {
            setProjectLoading((prev) => ({ ...prev, [project.name]: false }))
          }, project.loadTime)
        })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    if (selectAll) {
      const allSelected = {}
      projects.forEach((project) => {
        allSelected[project.name] = true
      })
      setSelectedProjects(allSelected)
    } else {
      setSelectedProjects({})
      setImportOptions({})
    }
  }, [selectAll])

  const handleProjectCheckboxChange = (projectName) => {
    setSelectedProjects((prev) => {
      const newSelectedProjects = { ...prev, [projectName]: !prev[projectName] }
      if (!newSelectedProjects[projectName]) {
        const newImportOptions = { ...importOptions }
        delete newImportOptions[projectName]
        setImportOptions(newImportOptions)
      }
      return newSelectedProjects
    })
  }

  const handleImportCheckboxChange = (projectName) => {
    setImportOptions((prev) => ({
      ...prev,
      [projectName]: !prev[projectName]
    }))
    setSelectedProjects((prev) => ({
      ...prev,
      [projectName]: true
    }))
  }

  const handleFinish = async () => {
    setButtonLoading(true)
    for (const project of Object.keys(selectedProjects)) {
      if (selectedProjects[project]) {
        await projectGroupCreate({
          variables: { name: project, desc: '', enabled: true }
        })
      }
    }
    setButtonLoading(false)
    onClose()
  }

  const LoadingSkeleton = () => (
    <Flex width={'100%'} gap={3} direction={'column'} mt={1}>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((_, index) => (
        <Box key={index} m={2}>
          <Skeleton width={'100%'} height='20px' mb={1} />
          <Skeleton width={'100%'} height='20px' />
        </Box>
      ))}
    </Flex>
  )

  const isButtonDisabled =
    initialLoading || !Object.values(selectedProjects).some((value) => value)

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      title={'Add GitHub Project'}
      buttonText={'Add selected repositories'}
      isLoading={buttonLoading}
      disabled={isButtonDisabled}
      onSubmit={handleFinish}
      Icon={FaGithub}
    >
      {initialLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          <Checkbox
            isChecked={selectAll}
            onChange={() => setSelectAll(!selectAll)}
            mb={4}
          >
            Select All
          </Checkbox>
          {projects.map((project) => (
            <Box
              key={project.name}
              mb={2}
              p={4}
              border='1px'
              borderColor='gray.200'
              borderRadius='md'
              _hover={{ backgroundColor: 'gray.50' }}
              backgroundColor={
                selectedProjects[project.name] ? 'gray.100' : 'white'
              }
            >
              <Flex justify='space-between' align='center'>
                <Flex direction='column' flex={1}>
                  <Checkbox
                    mr={2}
                    isChecked={selectedProjects[project.name] || false}
                    onChange={() => handleProjectCheckboxChange(project.name)}
                  >
                    <Flex align='center'>
                      <FaCodeBranch
                        style={{ marginRight: '8px' }}
                        color={primaryTextColor}
                      />
                      <Text fontWeight='semibold' color={primaryTextColor}>
                        {project.name}
                      </Text>
                    </Flex>
                  </Checkbox>
                </Flex>
                <Flex flex={1} justify='flex-end'>
                  {projectLoading[project.name] ? (
                    <Spinner size='sm' />
                  ) : (
                    <Text fontSize={14} color={labelColor}>
                      {project.label}
                    </Text>
                  )}
                </Flex>
              </Flex>
              {project.checkboxLabel &&
                !projectLoading[project.name] &&
                selectedProjects[project.name] && (
                  <Checkbox
                    mt={2}
                    ml={6}
                    isChecked={importOptions[project.name] || false}
                    onChange={() => handleImportCheckboxChange(project.name)}
                    size='sm'
                  >
                    <Text fontSize={14} color={labelColor}>
                      {project.checkboxLabel}
                    </Text>
                  </Checkbox>
                )}
            </Box>
          ))}
        </>
      )}
    </LynkModal>
  )
}

export default GithubAddModal
