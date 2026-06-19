import { useState } from 'react';

export default function OtpAuthForm({
  title,
  subtitle,
  purpose,
  sendOtp,
  verifyOtp,
  alternateLink,
  onSuccess,
}) {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await sendOtp(email);
      setStep('otp');
      setMessage('Check your inbox for a 6-digit code.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await verifyOtp(email, code);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError(null);
    try {
      await sendOtp(email);
      setMessage('New code sent.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle mx-auto">{subtitle}</p>
      </div>

      <div className="card-flat">
        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-muted dark:text-ink-dark-muted mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>
            {error && <p className="text-sm text-ink-muted dark:text-ink-dark-muted">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Sending…' : purpose === 'signup' ? 'Send code' : 'Send sign-in code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-ink-muted dark:text-ink-dark-muted">
              Sent to <span className="text-ink dark:text-ink-dark">{email}</span>
            </p>
            <div>
              <label className="block text-xs font-medium text-ink-muted dark:text-ink-dark-muted mb-1.5">
                Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input-field text-center tracking-[0.35em] text-lg font-medium"
                required
                autoComplete="one-time-code"
                placeholder="000000"
              />
            </div>
            {message && <p className="text-sm text-ink-muted dark:text-ink-dark-muted">{message}</p>}
            {error && <p className="text-sm text-ink-muted dark:text-ink-dark-muted">{error}</p>}
            <button type="submit" disabled={loading || code.length !== 6} className="btn-primary w-full py-2.5">
              {loading ? 'Verifying…' : purpose === 'signup' ? 'Create account' : 'Sign in'}
            </button>
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => { setStep('email'); setCode(''); setError(null); setMessage(null); }}
                className="text-ink-faint hover:text-ink dark:hover:text-ink-dark"
              >
                Change email
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-ink-faint hover:text-ink dark:hover:text-ink-dark"
              >
                Resend
              </button>
            </div>
          </form>
        )}
      </div>

      {alternateLink}
    </>
  );
}
