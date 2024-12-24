// /app/lib/data.ts

import { sql } from '@vercel/postgres';

export async function fetchRevenue() {
  const result = await sql`
    SELECT month, revenue FROM revenue ORDER BY month DESC LIMIT 12
  `;
  return result.rows;
}

export async function fetchLatestInvoices() {
  const result = await sql`
    SELECT invoices.amount, customers.name, customers.image_url, customers.email
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    ORDER BY invoices.date DESC
    LIMIT 5
  `;
  return result.rows;
}

export async function fetchCardData() {
  const [invoiceCountResult, customerCountResult, invoiceStatusResult] = await Promise.all([
    sql`SELECT COUNT(*) FROM invoices`,
    sql`SELECT COUNT(*) FROM customers`,
    sql`
      SELECT
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
      FROM invoices
    `,
  ]);

  return {
    numberOfInvoices: invoiceCountResult.rows[0].count,
    numberOfCustomers: customerCountResult.rows[0].count,
    totalPaidInvoices: invoiceStatusResult.rows[0].paid,
    totalPendingInvoices: invoiceStatusResult.rows[0].pending,
  };
}
