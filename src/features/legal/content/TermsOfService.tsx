import { LegalPage, Who } from '../components/LegalPage'

export function TermsOfService() {
  return (
    <LegalPage title="Terms of Service">
      <p>
        Scentpocket is a demonstration store built for the HNG Internship.{' '}
        <strong>Nothing on this site is for sale.</strong> Orders placed here
        are recorded for demonstration only: no product will be delivered and no
        payment will be collected. Brand names and product images belong to
        their respective owners and are used only to make the demo realistic;
        Scentpocket is not affiliated with them.
      </p>
      <p>
        The rest of these terms describe how the store would work if it were
        live.
      </p>
      <Who />
      <h2>2. Your account</h2>
      <p>
        You sign in with your Google account. You&apos;re responsible for
        activity on your account. You must be 18 or older to place an order.
      </p>
      <h2>3. Products and prices</h2>
      <ul>
        <li>
          Prices are in Nigerian naira (₦) and include applicable taxes unless
          stated.
        </li>
        <li>
          We try to show accurate descriptions, notes, sizes and prices. If a
          price is clearly wrong, we may cancel the order and tell you; you
          won&apos;t be charged.
        </li>
        <li>
          Scent notes, longevity and projection are guides; how a fragrance
          smells and lasts varies from person to person.
        </li>
      </ul>
      <h2>4. Orders</h2>
      <ul>
        <li>
          Placing an order is an offer to buy. We accept it when we confirm it
          (status &quot;Confirmed&quot;).
        </li>
        <li>
          Stock is reserved when you place the order. We may cancel an order if
          an item turns out to be unavailable, and will tell you if we do.
        </li>
        <li>You can ask us to cancel an order until it has been shipped.</li>
      </ul>
      <h2>5. Payment</h2>
      <p>
        Payment is <strong>on delivery</strong>, by cash or bank transfer to the
        rider. Other payment methods may be added later.
      </p>
      <h2>6. Delivery</h2>
      <table>
        <thead>
          <tr>
            <th>Zone</th>
            <th>Fee</th>
            <th>Typical time</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Lagos Mainland</td>
            <td>₦3,000</td>
            <td>1 to 2 working days</td>
          </tr>
          <tr>
            <td>Lagos Island</td>
            <td>₦4,500</td>
            <td>1 to 2 working days</td>
          </tr>
          <tr>
            <td>Outside Lagos</td>
            <td>₦7,000</td>
            <td>3 to 5 working days</td>
          </tr>
        </tbody>
      </table>
      <p>
        Delivery times are estimates.
      </p>
      <h2>7. Returns and refunds</h2>
      <ul>
        <li>
          <strong>Unopened, sealed</strong> bottles can be returned within{' '}
          <strong>7 days</strong> of delivery.
        </li>
        <li>
          Opened or used fragrances can&apos;t be returned, for hygiene reasons,
          unless they are faulty.
        </li>
        <li>
          If an item arrives <strong>damaged, faulty or wrong</strong>, tell us
          within 48 hours with a photo and we&apos;ll replace it or refund you
          at our cost.
        </li>
        <li>
          Refunds are paid back by bank transfer within 7 working days of
          receiving the return.
        </li>
      </ul>
      <p>
        Nothing in these terms limits your rights under the Federal Competition
        and Consumer Protection Act 2018.
      </p>
      <h2>8. Acceptable use</h2>
      <p>
        Don&apos;t misuse the site: no attempts to break security, scrape at
        scale, or place fake orders to hold stock.
      </p>
      <h2>9. Liability</h2>
      <p>
        We&apos;re not liable for indirect losses. Our total liability for any
        order is limited to the amount paid for it. Nothing here excludes
        liability that can&apos;t be excluded by law.
      </p>
      <h2>10. Privacy</h2>
      <p>
        See our <a href="/privacy">Privacy Policy</a>.
      </p>
      <h2>11. Law</h2>
      <p>
        These terms are governed by the laws of the Federal Republic of Nigeria,
        and the courts of Lagos State have jurisdiction.
      </p>
      <h2>12. Changes</h2>
      <p>We&apos;ll update the date at the top when these terms change.</p>
    </LegalPage>
  )
}
