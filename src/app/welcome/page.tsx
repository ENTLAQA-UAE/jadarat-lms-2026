import NonAuthHOC from "@/hoc/nonAuth.hoc"
import WelcomePage from "./WelcomePage"


function Welcome() {
  return (
    <NonAuthHOC component={WelcomePage} key="welcome" />
  )
}

export default Welcome