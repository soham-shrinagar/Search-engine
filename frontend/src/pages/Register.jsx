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
    <PageLayout maxWidth="max-w-sm">
      <OtpAuthForm
        title="Create account"
        subtitle="Verify your email to unlock bookmarks, saved searches, and history."
        purpose="signup"
        sendOtp={sendSignupOtp}
        verifyOtp={verifySignupOtp}
        onSuccess={() => navigate(redirectTo)}
        alternateLink={(
          <p className="text-center text-sm text-neutral-400 mt-5">
            Already have an account?{' '}
            <Link
              to="/login"
              state={{ from: redirectTo }}
              className="text-neutral-950 dark:text-neutral-50 hover:underline underline-offset-2"
            >
              Sign in
            </Link>
          </p>
        )}
      />
    </PageLayout>
  );
}
