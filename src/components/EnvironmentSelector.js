import React from 'react'
import { capitalizeFirstLetter } from 'utils'

import {
  Checkbox,
  FormControl,
  FormLabel,
  Skeleton,
  VStack
} from '@chakra-ui/react'

const EnvironmentSelector = ({
  ruleExists,
  envLoading,
  defaultEnv,
  options = [],
  selectedEnvironments = [],
  handleCheckboxChange,
  fixed
}) => {
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
      {envLoading ? (
        <VStack align='start'>
          {/* Loading Skeletons */}
          <Skeleton height='16px' width='150px' />
          <Skeleton height='16px' width='150px' />
          <Skeleton height='16px' width='150px' />
        </VStack>
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
              isChecked={selectedEnvironments.some(
                (env) => env.value === option.value
              )}
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
