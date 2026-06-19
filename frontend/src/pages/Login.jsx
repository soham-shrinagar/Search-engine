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
    <PageLayout>
      <OtpAuthForm
        title="Sign in"
        subtitle="We'll send a code to your email."
        purpose="login"
        sendOtp={sendLoginOtp}
        verifyOtp={verifyLoginOtp}
        onSuccess={() => navigate(redirectTo)}
        alternateLink={(
          <p className="text-center text-sm text-ink-faint mt-6">
            New here?{' '}
            <Link to="/register" state={{ from: redirectTo }} className="link-subtle">
              Create account
            </Link>
          </p>
        )}
      />
    </PageLayout>
  );
}
