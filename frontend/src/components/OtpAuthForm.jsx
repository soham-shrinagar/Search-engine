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
      setMessage('Check your email for a 6-digit code. In development, check the server console.');
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
      setMessage('A new code has been sent.');
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
        <p className="page-subtitle">{subtitle}</p>
      </div>

      <div className="card p-6">
        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
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
            {error && <p className="text-sm text-neutral-600 dark:text-neutral-400">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending code…' : purpose === 'signup' ? 'Send verification code' : 'Send sign-in code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Code sent to <span className="text-neutral-950 dark:text-neutral-50">{email}</span>
            </p>
            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
                Verification code
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input-field text-center tracking-[0.3em] text-lg"
                required
                autoComplete="one-time-code"
                placeholder="000000"
              />
            </div>
            {message && <p className="text-sm text-neutral-500 dark:text-neutral-400">{message}</p>}
            {error && <p className="text-sm text-neutral-600 dark:text-neutral-400">{error}</p>}
            <button type="submit" disabled={loading || code.length !== 6} className="btn-primary w-full">
              {loading ? 'Verifying…' : purpose === 'signup' ? 'Create account' : 'Sign in'}
            </button>
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => { setStep('email'); setCode(''); setError(null); setMessage(null); }}
                className="text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-50"
              >
                Change email
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-50"
              >
                Resend code
              </button>
            </div>
          </form>
        )}
      </div>

      {alternateLink}
    </>
  );
}
