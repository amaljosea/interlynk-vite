import { useEffect, useState } from 'react'

const useGithubConfigSaved = () => {
  const [isGithubConfigSaved, setIsGithubConfigSaved] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('githubConfigSaved')
    setIsGithubConfigSaved(saved === 'true')
  }, [])

  return isGithubConfigSaved
}

export default useGithubConfigSaved
