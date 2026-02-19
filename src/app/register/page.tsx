import RegisterForm from './RegisterForm';
import NonAuthHOC from '@/hoc/nonAuth.hoc';

function Register() {
  return <NonAuthHOC component={RegisterForm} />;
}

export default Register;
