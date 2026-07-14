import React, { useState, useCallback, useRef } from "react";

// ---------- Validation helpers (custom regex, no libs) ----------
const RE = {
  name: /^[A-Za-z][A-Za-z\s'-]{1,49}$/,
  phone: /^\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  zip: /^\d{5}(-\d{4})?$/,
  onlyLetters: /^[A-Za-z\s'-]*$/,
};

function sanitize(input) {
  // Strip tags/script-like content and neutralize angle brackets to prevent XSS on render/store
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/javascript:/gi, "")
    .slice(0, 300);
}

const STEPS = [
  { id: "identity", label: "Volunteer" },
  { id: "availability", label: "Availability" },
  { id: "roles", label: "Roles" },
  { id: "review", label: "Review" },
];

const ROLE_OPTIONS = [
  "Food Prep",
  "Serving Line",
  "Dish Washing",
  "Delivery Driver",
  "Intake Desk",
  "Storage & Inventory",
];

const DAY_OPTIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function useLiveRegion() {
  const [msg, setMsg] = useState("");
  const announce = useCallback((text) => {
    setMsg("");
    // force re-announcement even if text repeats
    requestAnimationFrame(() => setMsg(text));
  }, []);
  return [msg, announce];
}

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={`${id}-error`} role="alert" className="field-error">
      {message}
    </p>
  );
}

function TextField({ id, label, value, onChange, error, type = "text", placeholder, required }) {
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required && <span className="req" aria-hidden="true"> *</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(sanitize(e.target.value))}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-required={required}
        className={error ? "invalid" : ""}
      />
      <FieldError id={id} message={error} />
    </div>
  );
}

export default function VolunteerIntakeForm() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [offline, setOffline] = useState(false);
  const [liveMsg, announce] = useLiveRegion();
  const formRef = useRef(null);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    zip: "",
    days: [],
    hoursPerWeek: "",
    roles: [],
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [availableRoles, setAvailableRoles] = useState(ROLE_OPTIONS);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState(false);

  const set = (key) => (val) => setData((d) => ({ ...d, [key]: val }));

  const toggleArrayValue = (key, value) => {
    setData((d) => {
      const arr = d[key].includes(value) ? d[key].filter((v) => v !== value) : [...d[key], value];
      return { ...d, [key]: arr };
    });
  };

  // Simulated async fetch for roles (demonstrates loading + empty + error states)
  const loadRoles = useCallback((simulateEmpty = false, simulateError = false) => {
    setRolesLoading(true);
    setRolesError(false);
    setAvailableRoles([]);
    setTimeout(() => {
      setRolesLoading(false);
      if (simulateError) {
        setRolesError(true);
        return;
      }
      setAvailableRoles(simulateEmpty ? [] : ROLE_OPTIONS);
    }, 1400);
  }, []);

  React.useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  function validateStep(idx) {
    const e = {};
    if (idx === 0) {
      if (!RE.name.test(data.firstName.trim())) e.firstName = "Enter a first name using letters only.";
      if (!RE.name.test(data.lastName.trim())) e.lastName = "Enter a last name using letters only.";
      if (!RE.phone.test(data.phone.trim())) e.phone = "Enter a 10-digit phone number, like 555-123-4567.";
      if (data.email.trim() && !RE.email.test(data.email.trim())) e.email = "Enter a valid email address.";
      if (data.zip.trim() && !RE.zip.test(data.zip.trim())) e.zip = "Enter a 5-digit ZIP code.";
    }
    if (idx === 1) {
      if (data.days.length === 0) e.days = "Select at least one day you're available.";
      const hrs = Number(data.hoursPerWeek);
      if (!data.hoursPerWeek.trim() || Number.isNaN(hrs) || hrs <= 0 || hrs > 80) {
        e.hoursPerWeek = "Enter hours per week between 1 and 80.";
      }
    }
    if (idx === 2) {
      if (data.roles.length === 0) e.roles = "Select at least one role.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function goNext() {
    if (!validateStep(step)) {
      announce("This step has errors. Please fix the highlighted fields.");
      const firstErrorEl = formRef.current?.querySelector(".invalid, [aria-invalid='true']");
      firstErrorEl?.focus();
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    announce(`Step ${step + 2} of ${STEPS.length}: ${STEPS[Math.min(step + 1, STEPS.length - 1)].label}`);
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }

  function handleSubmit() {
    if (!validateStep(2)) return;
    setSubmitting(true);
    setOffline(false);

    // Simulate spotty connectivity: random delay, small chance of failure, recoverable
    const willFail = Math.random() < 0.12;
    setTimeout(() => {
      setSubmitting(false);
      if (willFail) {
        setOffline(true);
        announce("Submission failed due to a connection issue. Your answers were saved locally. Try again.");
        return;
      }
      // eslint-disable-next-line no-console
      console.log("[Analytics] User interacted with Multi-Step Validation: submit_complete");
      setSubmitted(true);
      announce("Registration submitted successfully.");
    }, 1600);
  }

  function resetForm() {
    setData({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      zip: "",
      days: [],
      hoursPerWeek: "",
      roles: [],
      notes: "",
    });
    setStep(0);
    setSubmitted(false);
    setOffline(false);
    setErrors({});
  }

  const progressPct = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="vif-root">
      <style>{`
        .vif-root {
          --ink: #1c1c1e;
          --ink-soft: #55565c;
          --line: #d7d7db;
          --line-soft: #ececee;
          --bg: #fafafa;
          --panel: #ffffff;
          --accent: #2f2f33;
          --error: #b3261e;
          --error-bg: #fdecea;
          --focus: #1c1c1e;
          --radius: 6px;
          font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: var(--ink);
          background: var(--bg);
          min-height: 100%;
          padding: 32px 16px;
          box-sizing: border-box;
        }
        .vif-root * { box-sizing: border-box; }
        .vif-card {
          max-width: 640px;
          margin: 0 auto;
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: var(--radius);
          padding: 32px;
        }
        @media (max-width: 480px) {
          .vif-card { padding: 20px; }
          .vif-root { padding: 16px 8px; }
        }
        .vif-header h1 {
          font-size: 20px;
          margin: 0 0 4px;
          letter-spacing: -0.01em;
        }
        .vif-header p {
          margin: 0 0 24px;
          color: var(--ink-soft);
          font-size: 14px;
        }
        .progress-track {
          height: 4px;
          background: var(--line-soft);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        .progress-fill {
          height: 100%;
          background: var(--accent);
          transition: width 0.3s ease;
        }
        .steps-nav {
          display: flex;
          justify-content: space-between;
          margin-bottom: 28px;
          font-size: 12px;
          color: var(--ink-soft);
        }
        .steps-nav .step-item {
          flex: 1;
          text-align: center;
          position: relative;
        }
        .steps-nav .step-item.active { color: var(--ink); font-weight: 600; }
        .steps-nav .step-item.done { color: var(--ink); }
        .field { margin-bottom: 20px; }
        .field label, .field-group-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 6px;
        }
        .field .req { color: var(--error); }
        .field input, .field textarea {
          width: 100%;
          padding: 10px 12px;
          font-size: 14px;
          border: 1px solid var(--line);
          border-radius: var(--radius);
          background: var(--panel);
          color: var(--ink);
          font-family: inherit;
        }
        .field input:focus, .field textarea:focus, .chip:focus-visible, button:focus-visible {
          outline: 2px solid var(--focus);
          outline-offset: 2px;
        }
        .field input.invalid, .field textarea.invalid {
          border-color: var(--error);
          background: var(--error-bg);
        }
        .field-error {
          color: var(--error);
          font-size: 12px;
          margin: 6px 0 0;
        }
        .row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 480px) {
          .row-2 { grid-template-columns: 1fr; }
        }
        .chip-group {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .chip {
          border: 1px solid var(--line);
          background: var(--panel);
          border-radius: 999px;
          padding: 8px 14px;
          font-size: 13px;
          cursor: pointer;
          color: var(--ink);
        }
        .chip[aria-pressed="true"] {
          background: var(--accent);
          color: #fff;
          border-color: var(--accent);
        }
        .section-title {
          font-size: 15px;
          font-weight: 700;
          margin: 0 0 16px;
        }
        .btn-row {
          display: flex;
          justify-content: space-between;
          margin-top: 28px;
          gap: 12px;
        }
        button {
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          padding: 10px 20px;
          border-radius: var(--radius);
          border: 1px solid var(--accent);
          cursor: pointer;
        }
        .btn-primary {
          background: var(--accent);
          color: #fff;
        }
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-secondary {
          background: var(--panel);
          color: var(--ink);
          border-color: var(--line);
        }
        .empty-state {
          text-align: center;
          padding: 32px 16px;
          color: var(--ink-soft);
          font-size: 14px;
          border: 1px dashed var(--line);
          border-radius: var(--radius);
        }
        .loading-row {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--ink-soft);
          font-size: 14px;
          padding: 16px 0;
        }
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid var(--line);
          border-top-color: var(--ink);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .spinner { animation: none; border-top-color: var(--line); }
          .progress-fill { transition: none; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .review-block {
          border: 1px solid var(--line-soft);
          border-radius: var(--radius);
          padding: 16px;
          margin-bottom: 16px;
        }
        .review-block dt { font-size: 12px; color: var(--ink-soft); margin-top: 10px; }
        .review-block dt:first-child { margin-top: 0; }
        .review-block dd { margin: 2px 0 0; font-size: 14px; }
        .banner {
          border-radius: var(--radius);
          padding: 14px 16px;
          font-size: 14px;
          margin-bottom: 20px;
        }
        .banner-error {
          background: var(--error-bg);
          color: var(--error);
          border: 1px solid var(--error);
        }
        .banner-success {
          text-align: center;
          padding: 48px 16px;
        }
        .banner-success h2 { margin: 0 0 8px; font-size: 20px; }
        .banner-success p { color: var(--ink-soft); margin: 0 0 24px; font-size: 14px; }
        .visually-hidden {
          position: absolute;
          width: 1px; height: 1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          white-space: nowrap;
        }
        .link-btn {
          background: none;
          border: none;
          color: var(--ink);
          text-decoration: underline;
          padding: 0;
          font-weight: 500;
        }
      `}</style>

      <div className="vif-card">
        <div aria-live="polite" className="visually-hidden">{liveMsg}</div>

        {submitted ? (
          <div className="banner-success">
            <h2>Registration submitted</h2>
            <p>Thank you, {data.firstName}. Your volunteer profile has been saved.</p>
            <button className="btn-primary" onClick={resetForm}>Register another volunteer</button>
          </div>
        ) : (
          <>
            <div className="vif-header">
              <h1>Volunteer Registration</h1>
              <p>Multi-step intake for Soup Kitchen Volunteers floor staff.</p>
            </div>

            <div
              className="progress-track"
              role="progressbar"
              aria-valuenow={step + 1}
              aria-valuemin={1}
              aria-valuemax={STEPS.length}
              aria-label={`Step ${step + 1} of ${STEPS.length}`}
            >
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="steps-nav">
              {STEPS.map((s, i) => (
                <div key={s.id} className={`step-item ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}>
                  {s.label}
                </div>
              ))}
            </div>

            {offline && (
              <div className="banner banner-error" role="alert">
                Connection issue during submission. Your answers are still here — check your connection and try again.
              </div>
            )}

            <form ref={formRef} onSubmit={(e) => e.preventDefault()} noValidate>
              {step === 0 && (
                <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
                  <legend className="section-title">Volunteer details</legend>
                  <div className="row-2">
                    <TextField id="firstName" label="First name" required value={data.firstName} onChange={set("firstName")} error={errors.firstName} />
                    <TextField id="lastName" label="Last name" required value={data.lastName} onChange={set("lastName")} error={errors.lastName} />
                  </div>
                  <TextField id="phone" label="Phone number" required placeholder="555-123-4567" value={data.phone} onChange={set("phone")} error={errors.phone} />
                  <div className="row-2">
                    <TextField id="email" label="Email (optional)" type="email" value={data.email} onChange={set("email")} error={errors.email} />
                    <TextField id="zip" label="ZIP code (optional)" value={data.zip} onChange={set("zip")} error={errors.zip} />
                  </div>
                </fieldset>
              )}

              {step === 1 && (
                <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
                  <legend className="section-title">Availability</legend>
                  <div className="field">
                    <span id="days-label" className="field-group-label">Days available *</span>
                    <div className="chip-group" role="group" aria-labelledby="days-label">
                      {DAY_OPTIONS.map((day) => (
                        <button
                          key={day}
                          type="button"
                          className="chip"
                          aria-pressed={data.days.includes(day)}
                          onClick={() => toggleArrayValue("days", day)}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                    <FieldError id="days" message={errors.days} />
                  </div>
                  <TextField id="hoursPerWeek" label="Hours available per week" required value={data.hoursPerWeek} onChange={set("hoursPerWeek")} error={errors.hoursPerWeek} placeholder="e.g. 8" />
                </fieldset>
              )}

              {step === 2 && (
                <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
                  <legend className="section-title">Preferred roles</legend>

                  {rolesLoading && (
                    <div className="loading-row" role="status">
                      <span className="spinner" aria-hidden="true" />
                      Loading available roles…
                    </div>
                  )}

                  {!rolesLoading && rolesError && (
                    <div className="empty-state" role="alert">
                      <p>Couldn&apos;t load roles due to a connection issue.</p>
                      <button type="button" className="link-btn" onClick={() => loadRoles()}>Try again</button>
                    </div>
                  )}

                  {!rolesLoading && !rolesError && availableRoles.length === 0 && (
                    <div className="empty-state">No roles are open right now. Check back later.</div>
                  )}

                  {!rolesLoading && !rolesError && availableRoles.length > 0 && (
                    <div className="field">
                      <div id="roles-label" className="visually-hidden">Select roles</div>
                      <div className="chip-group" role="group" aria-labelledby="roles-label">
                        {availableRoles.map((role) => (
                          <button
                            key={role}
                            type="button"
                            className="chip"
                            aria-pressed={data.roles.includes(role)}
                            onClick={() => toggleArrayValue("roles", role)}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                      <FieldError id="roles" message={errors.roles} />
                    </div>
                  )}

                  <div className="field">
                    <label htmlFor="notes">Notes for coordinator (optional)</label>
                    <textarea
                      id="notes"
                      rows={3}
                      value={data.notes}
                      onChange={(e) => set("notes")(sanitize(e.target.value))}
                    />
                  </div>
                </fieldset>
              )}

              {step === 3 && (
                <div>
                  <p className="section-title">Review before submitting</p>
                  <dl className="review-block">
                    <dt>Name</dt>
                    <dd>{data.firstName} {data.lastName}</dd>
                    <dt>Phone</dt>
                    <dd>{data.phone}</dd>
                    {data.email && (<><dt>Email</dt><dd>{data.email}</dd></>)}
                    {data.zip && (<><dt>ZIP</dt><dd>{data.zip}</dd></>)}
                    <dt>Available days</dt>
                    <dd>{data.days.join(", ") || "—"}</dd>
                    <dt>Hours per week</dt>
                    <dd>{data.hoursPerWeek}</dd>
                    <dt>Roles</dt>
                    <dd>{data.roles.join(", ") || "—"}</dd>
                    {data.notes && (<><dt>Notes</dt><dd>{data.notes}</dd></>)}
                  </dl>
                </div>
              )}

              <div className="btn-row">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={goBack}
                  disabled={step === 0 || submitting}
                >
                  Back
                </button>

                {step < STEPS.length - 1 ? (
                  <button type="button" className="btn-primary" onClick={goNext}>
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting…" : "Submit registration"}
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
