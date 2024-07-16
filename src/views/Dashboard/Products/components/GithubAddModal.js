import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'

import {
  Box,
  Button,
  Checkbox,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Spinner,
  Text
} from '@chakra-ui/react'

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
    <Modal isOpen={isOpen} onClose={onClose} size='2xl'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex align='center'>
            <FaGithub style={{ marginRight: '8px' }} />
            Add GitHub Project
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
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
                  <Flex justify='space-between' align='end'>
                    <Flex align='center' flex={1}>
                      <Checkbox
                        mr={2}
                        isChecked={selectedProjects[project.name] || false}
                        onChange={() =>
                          handleProjectCheckboxChange(project.name)
                        }
                      >
                        <Flex align='center'>
                          <FaCodeBranch style={{ marginRight: '8px' }} />
                          <Text fontWeight='semibold'>{project.name}</Text>
                        </Flex>
                      </Checkbox>
                    </Flex>
                    <Flex flex={1} justify='center'>
                      {!projectLoading[project.name] && (
                        <Text fontSize={14}>{project.label}</Text>
                      )}
                    </Flex>
                    <Flex flex={1} justify='flex-end' align='center'>
                      {projectLoading[project.name] ? (
                        <Spinner size='sm' />
                      ) : (
                        project.checkboxLabel && (
                          <Checkbox
                            mt={2}
                            isChecked={importOptions[project.name] || false}
                            onChange={() =>
                              handleImportCheckboxChange(project.name)
                            }
                            size='sm'
                          >
                            <Text fontSize={14}>{project.checkboxLabel}</Text>
                          </Checkbox>
                        )
                      )}
                    </Flex>
                  </Flex>
                </Box>
              ))}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme='gray' mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme='blue'
            onClick={handleFinish}
            isLoading={buttonLoading}
            disabled={isButtonDisabled}
          >
            Add selected repositories
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default GithubAddModal
