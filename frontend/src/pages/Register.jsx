import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageLayout from '../components/PageLayout';
import OtpAuthForm from '../components/OtpAuthForm';

export default function Register() {
  const { sendSignupOtp, verifySignupOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  return (
    <PageLayout>
      <OtpAuthForm
        title="Sign up"
        subtitle="Verify your email to save bookmarks and searches."
        purpose="signup"
        sendOtp={sendSignupOtp}
        verifyOtp={verifySignupOtp}
        onSuccess={() => navigate(redirectTo)}
        alternateLink={(
          <p className="text-center text-sm text-ink-faint mt-6">
            Have an account?{' '}
            <Link to="/login" state={{ from: redirectTo }} className="link-subtle">
              Sign in
            </Link>
          </p>
        )}
      />
    </PageLayout>
  );
}
