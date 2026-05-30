import * as React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Checkbox } from '../../../shared/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '../../../shared/ui/dialog';
import { cn } from '../../../shared/lib/utils';

type Role = 'patient' | 'doctor';

interface Props {
  onRoleChange?: (role: Role) => void;
}

export function RegisterForm({ onRoleChange }: Props) {
  const { register } = useAuth();
  const [role, setRole] = React.useState<Role>('patient');

  function handleRoleChange(r: Role) {
    setRole(r);
    onRoleChange?.(r);
  }
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [specialization, setSpecialization] = React.useState('');
  const [privacyAccepted, setPrivacyAccepted] = React.useState(false);
  const [privacyError, setPrivacyError] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!privacyAccepted) {
      setPrivacyError(true);
      return;
    }
    setPrivacyError(false);
    setError(null);
    setIsPending(true);
    try {
      await register({
        email,
        password,
        firstName,
        lastName,
        role,
        ...(role === 'doctor' ? { specialization } : {}),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Role selector */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">I am a</span>
        <div className="grid grid-cols-2 gap-2">
          {(['patient', 'doctor'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRoleChange(r)}
              className={cn(
                'rounded-lg border py-2 text-sm font-medium capitalize transition-colors',
                role === r
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-transparent text-muted-foreground hover:border-foreground/50 hover:text-foreground',
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* First + Last name side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="firstName" className="text-sm font-medium">
            First name
          </label>
          <Input
            id="firstName"
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Jane"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lastName" className="text-sm font-medium">
            Last name
          </label>
          <Input
            id="lastName"
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="reg-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-password" className="text-sm font-medium">
          Password
        </label>
        <Input
          id="reg-password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
        />
      </div>

      {role === 'doctor' && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="specialization" className="text-sm font-medium">
            Specialization
          </label>
          <Input
            id="specialization"
            type="text"
            required
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            placeholder="e.g. Cardiology"
          />
        </div>
      )}

      {/* Data Privacy consent */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-2.5">
          <Checkbox
            id="privacy-consent"
            checked={privacyAccepted}
            onCheckedChange={(checked) => {
              setPrivacyAccepted(checked === true);
              if (checked) setPrivacyError(false);
            }}
            className="mt-0.5"
          />
          <label
            htmlFor="privacy-consent"
            className="text-xs leading-relaxed text-muted-foreground cursor-pointer"
          >
            I have read and agree to the{' '}
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="font-medium text-foreground underline underline-offset-2 hover:text-primary transition-colors"
                >
                  Data Privacy Act of 2012 (Republic Act No. 10173)
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    Data Privacy Act of 2012 — Republic Act No. 10173
                  </DialogTitle>
                </DialogHeader>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-6 py-4 text-sm text-muted-foreground space-y-4">
                  <p>
                    The <strong className="text-foreground">Data Privacy Act of 2012 (RA 10173)</strong> is a Philippine
                    law that protects all forms of information — private, personal, or sensitive — from unauthorized use,
                    processing, and disclosure.
                  </p>

                  <div>
                    <h3 className="font-semibold text-foreground mb-1">What information we collect</h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Full name, date of birth, sex, and contact details</li>
                      <li>Physical measurements (weight, height) and blood type</li>
                      <li>Medical history, current medications, and allergies</li>
                      <li>Emergency contact information</li>
                      <li>Appointment records, consultation notes, and prescriptions</li>
                      <li>Profile photo (if uploaded)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-1">How we use your information</h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>To facilitate telehealth consultations between patients and doctors</li>
                      <li>To maintain accurate medical records for your care</li>
                      <li>To send appointment notifications and reminders</li>
                      <li>To improve the quality and safety of our services</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Your rights under RA 10173</h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong className="text-foreground">Right to be informed</strong> — know how your data is collected and used</li>
                      <li><strong className="text-foreground">Right to access</strong> — request a copy of your personal data</li>
                      <li><strong className="text-foreground">Right to correction</strong> — have inaccurate data corrected</li>
                      <li><strong className="text-foreground">Right to erasure</strong> — request deletion of your data</li>
                      <li><strong className="text-foreground">Right to object</strong> — oppose unauthorized processing</li>
                      <li><strong className="text-foreground">Right to data portability</strong> — obtain your data in a usable format</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Data security</h3>
                    <p>
                      Your personal and medical information is stored securely and accessed only by authorized
                      healthcare providers involved in your care. We implement appropriate technical and organizational
                      measures to protect your data from unauthorized access, disclosure, or loss.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Consent</h3>
                    <p>
                      By creating an account, you consent to the collection, use, and processing of your personal
                      information as described above, in accordance with the Data Privacy Act of 2012 and its
                      Implementing Rules and Regulations.
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground/70 border-t border-border pt-3">
                    For questions or concerns regarding your data privacy rights, please contact our Data Protection
                    Officer. Reference: Republic Act No. 10173, implemented by the National Privacy Commission (NPC).
                  </p>
                </div>

                {/* Sticky footer */}
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Close
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      onClick={() => {
                        setPrivacyAccepted(true);
                        setPrivacyError(false);
                      }}
                    >
                      I understand & agree
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {' '}and consent to the collection and processing of my personal information.
          </label>
        </div>
        {privacyError && (
          <p className="text-xs text-destructive" role="alert">
            You must accept the Data Privacy Act to continue.
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full mt-1"
      >
        {isPending ? 'Creating account…' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
