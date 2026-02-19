import React from 'react'
import CreateAccount from './CreateAccount'
import NonAuthHOC from '@/hoc/nonAuth.hoc'

function CreateAccountPage() {
  return (
    <NonAuthHOC component={CreateAccount} />
  )
}

export default CreateAccountPage