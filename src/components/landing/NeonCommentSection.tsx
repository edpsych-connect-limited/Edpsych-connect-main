import { Client } from '@neondatabase/serverless';
import { redirect } from 'next/navigation';

type NeonCommentSectionProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

async function handleCommentSubmission(formData: FormData) {
  'use server';

  const name = formData.get('name')?.toString().trim();
  const email = formData.get('email')?.toString().trim();
  const message = formData.get('message')?.toString().trim();

  if (!name || !email || !message) {
    throw new Error('Please complete every field before submitting your comment.');
  }

  const connectionString =
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('Missing `POSTGRES_URL` environment variable.');
  }

  const client = new Client({ connectionString });
  try {
    await client.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(
      `INSERT INTO comments (name, email, message) VALUES ($1, $2, $3)`,
      [name, email, message]
    );
  } finally {
    await client.end();
  }

  redirect('/?commented=1');
}

export default function NeonCommentSection({ searchParams }: NeonCommentSectionProps) {
  const commentSent = searchParams?.commented === '1';

  return (
    <section className="py-16 bg-white border-t border-b border-neutral-100">
      <div className="container-wide grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Neon comments
          </p>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900">
            Share a quick note—results land straight in Neon.
          </h2>
          <p className="text-lg text-neutral-600">
            This form uses the `@neondatabase/serverless` driver to insert feedback directly into the
            `comments` table so we can verify persistence on the Neon Postgres cluster.
          </p>
          {commentSent ? (
            <p className="rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-800">
              Thanks for sending a comment! We just recorded it in Neon.
            </p>
          ) : (
            <p className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              Submit a few words and we will store them as evidence that Neon is receiving writes.
            </p>
          )}
        </div>
        <form
          action={handleCommentSubmission}
          className="space-y-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 shadow-strong"
        >
          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              required
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="email">
              School or work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
              placeholder="name@school.edu"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
              placeholder="Tell us how you would use Neon in your day-to-day."
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Submit comment
          </button>
        </form>
      </div>
    </section>
  );
}
