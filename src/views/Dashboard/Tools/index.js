import OrgRegister from 'views/Dashboard/Profile/components/OrgRegister'

import Compare from './Compare'

const Tools = () => {
  const org = localStorage.getItem('organization')

  if (!org || org === 'undefined') return <OrgRegister />

  return <Compare selectedSboms={null} />
}

export default Tools
