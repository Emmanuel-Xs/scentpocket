import { LEGAL } from '../constants'
import { LegalPage, Who } from '../components/LegalPage'

export function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        Scentpocket is a demonstration store built for the HNG Internship.
        Nothing on this site is for sale and no order will be delivered or
        charged. We still treat the information you give us with care, as
        described below.
      </p>
      <Who />
      <h2>2. What we collect</h2>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Source</th>
            <th>When</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Name, email address, profile picture</td>
            <td>
              Your Google account, when you choose &quot;Continue with
              Google&quot;
            </td>
            <td>Sign in</td>
          </tr>
          <tr>
            <td>Phone number, delivery address, city, state, delivery zone</td>
            <td>You, at checkout</td>
            <td>Placing an order</td>
          </tr>
          <tr>
            <td>
              Order details (items, sizes, quantities, prices, status, dates)
            </td>
            <td>Created by your order</td>
            <td>Placing an order</td>
          </tr>
          <tr>
            <td>Cart contents</td>
            <td>
              Stored in your own browser (local storage), not on our servers
            </td>
            <td>Shopping</td>
          </tr>
          <tr>
            <td>Technical logs (IP address, browser, timestamps)</td>
            <td>Our hosting and database providers</td>
            <td>Any visit</td>
          </tr>
        </tbody>
      </table>
      <p>
        We only request the basic Google permissions (your name, email and
        profile picture). We cannot read your Gmail, contacts or files.
      </p>
      <h2>3. Why we use it (lawful basis)</h2>
      <table>
        <thead>
          <tr>
            <th>Purpose</th>
            <th>Lawful basis under the NDPA</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Creating your account and signing you in</td>
            <td>
              Performance of a contract (providing the service you asked for)
            </td>
          </tr>
          <tr>
            <td>
              Processing and showing your orders, sending order confirmation
              emails
            </td>
            <td>Performance of a contract</td>
          </tr>
          <tr>
            <td>Keeping the site secure and fixing problems</td>
            <td>Legitimate interests</td>
          </tr>
          <tr>
            <td>Keeping order records</td>
            <td>Legal obligation and legitimate interests</td>
          </tr>
        </tbody>
      </table>
      <p>
        We do not sell your data, use it for advertising, or make automated
        decisions that have legal or similarly significant effects on you.
      </p>
      <h2>4. Who receives it</h2>
      <p>We share data only with service providers that help run the site:</p>
      <table>
        <thead>
          <tr>
            <th>Provider</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Supabase</td>
            <td>Database, authentication, file storage</td>
          </tr>
          <tr>
            <td>Netlify</td>
            <td>Website hosting</td>
          </tr>
          <tr>
            <td>Google</td>
            <td>
              Sign in (Google OAuth) and, as a fallback, sending email through
              Gmail
            </td>
          </tr>
          <tr>
            <td>Mailgun</td>
            <td>Sending order confirmation emails</td>
          </tr>
        </tbody>
      </table>
      <p>
        Some of these providers store data outside Nigeria. Where they do, we
        rely on their contractual and security commitments to protect it as the
        NDPA requires.
      </p>
      <h2>5. How long we keep it</h2>
      <ul>
        <li>Account data: until you ask us to delete your account.</li>
        <li>
          Orders: 2 years from the order date, then deleted. As this is a demo,
          we may delete all data at any time when the project ends.
        </li>
        <li>Cart: until you clear your browser storage.</li>
      </ul>
      <h2>6. Your rights</h2>
      <p>Under the NDPA you can:</p>
      <ul>
        <li>ask for a copy of the personal data we hold about you;</li>
        <li>ask us to correct inaccurate data;</li>
        <li>ask us to delete your data;</li>
        <li>ask us to restrict or object to how we use it;</li>
        <li>withdraw consent where we rely on it;</li>
        <li>ask for your data in a portable format.</li>
      </ul>
      <p>
        Email <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
        We&apos;ll reply within 30 days. You also have the right to complain to
        the <strong>Nigeria Data Protection Commission (NDPC)</strong>.
      </p>
      <h2>7. Security</h2>
      <p>
        Data is encrypted in transit (HTTPS). Database access is restricted to
        our server; the public website cannot read other customers&apos; data.
        If a breach is likely to put your rights at risk, we will notify the
        NDPC within 72 hours and tell you without undue delay.
      </p>
      <h2>8. Children</h2>
      <p>Scentpocket is not intended for anyone under 18.</p>
      <h2>9. Changes</h2>
      <p>We&apos;ll update the date at the top when this policy changes.</p>
    </LegalPage>
  )
}
