import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageLayout from '../components/PageLayout';
import OtpAuthForm from '../components/OtpAuthForm';

export default function Login() {
  const { sendLoginOtp, verifyLoginOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  return (
    <PageLayout maxWidth="max-w-sm">
      <OtpAuthForm
        title="Sign in"
        subtitle="We'll email you a one-time code. No password needed."
        purpose="login"
        sendOtp={sendLoginOtp}
        verifyOtp={verifyLoginOtp}
        onSuccess={() => navigate(redirectTo)}
        alternateLink={(
          <p className="text-center text-sm text-neutral-400 mt-5">
            New here?{' '}
            <Link
              to="/register"
              state={{ from: redirectTo }}
              className="text-neutral-950 dark:text-neutral-50 hover:underline underline-offset-2"
            >
              Create an account
            </Link>
          </p>
        )}
      />
    </PageLayout>
  );
}
