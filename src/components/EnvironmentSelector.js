import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { capitalizeFirstLetter } from 'utils'

import { Box, Checkbox, SkeletonText, VStack } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/react'

import { useProjectGroup } from 'hooks/useProjectGroup'

const EnvironmentSelector = (props) => {
  const params = useParams()

  const { ruleExists, fixed, environments, setEnvironments } = props

  const [options, setOptions] = useState([])
  const [defaultEnv, setDefaultEnv] = useState(null)

  const { projects, loading: loading } = useProjectGroup({
    skip: params.productgroupid ? false : true,
    projectGroupId: params.productgroupid
  })

  const handleCheckboxChange = (env, isChecked) => {
    if (env.value === defaultEnv?.value) {
      // Default option cannot be unchecked
      return
    }

    if (isChecked) {
      setEnvironments((prev) => [...prev, env])
    } else {
      setEnvironments((prev) => prev.filter((item) => item.value !== env.value))
    }
  }

  useEffect(() => {
    const defaultOption = projects.find(
      (project) => project.id === params.productid
    )
    if (defaultOption) {
      const defaultEnvObj = {
        value: defaultOption.id,
        label: defaultOption.name
      }
      setDefaultEnv(defaultEnvObj)
      setEnvironments([defaultEnvObj])
    }

    const otherOptions = projects
      .filter((project) => project.id !== params.productid)
      .map((project) => ({
        value: project.id,
        label: project.name
      }))
    setOptions(otherOptions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  if (ruleExists) return null

  return (
    <FormControl mt={2}>
      <FormLabel>
        Environments
        <span hidden={ruleExists === undefined}>
          {' '}
          - only applicable for saving as rule
        </span>
      </FormLabel>
      {loading ? (
        <Box mt={2}>
          <SkeletonText noOfLines={3} spacing='3' skeletonHeight='2' />
        </Box>
      ) : (
        <VStack align='start'>
          {/* Default Environment */}
          <Checkbox
            isChecked
            isDisabled
            value={defaultEnv?.value}
            onChange={() => {}}
          >
            {capitalizeFirstLetter(defaultEnv?.label)}
          </Checkbox>

          {/* Other Environments */}
          {options.map((option) => (
            <Checkbox
              key={option.value}
              isDisabled={fixed}
              isChecked={environments.some((env) => env.value === option.value)}
              onChange={(e) => handleCheckboxChange(option, e.target.checked)}
            >
              {capitalizeFirstLetter(option?.label)}
            </Checkbox>
          ))}
        </VStack>
      )}
    </FormControl>
  )
}

export default EnvironmentSelector
