import { isAuthenticated, getAdminData, loginAction, logoutAction, getIpBlockStatus } from './actions'
import AdminClient from './AdminClient'

export const metadata = { title: 'Admin — Useful Gears' }
export const dynamic = 'force-dynamic'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const authed = await isAuthenticated()

  if (!authed) {
    const [{ error }, blockStatus] = await Promise.all([
      searchParams,
      getIpBlockStatus(),
    ])

    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div
          className="w-full max-w-sm p-8 rounded-2xl flex flex-col gap-6"
          style={{ background: 'rgba(13,20,33,0.9)', border: '1px solid rgba(201,165,90,0.2)' }}
        >
          <h1
            className="text-gradient-gold text-center"
            style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 700 }}
          >
            Admin
          </h1>

          {blockStatus.blocked ? (
            <p className="text-red-400 text-sm text-center">
              Too many attempts. Try again in {blockStatus.minutesLeft} minutes.
            </p>
          ) : error === 'wrong' ? (
            <p className="text-red-400 text-sm text-center">Wrong password.</p>
          ) : null}

          <form action={loginAction} className="flex flex-col gap-4">
            <input
              name="password"
              type="password"
              placeholder="Password"
              autoFocus
              disabled={blockStatus.blocked}
              className="w-full px-4 py-3 rounded-xl text-sm text-[#ede8dc] outline-none disabled:opacity-40"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,165,90,0.25)' }}
            />
            <button
              type="submit"
              disabled={blockStatus.blocked}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
              style={{ background: 'rgba(201,165,90,0.15)', border: '1px solid rgba(201,165,90,0.4)', color: '#c9a55a' }}
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    )
  }

  const data = await getAdminData()
  if (!data) return null

  return <AdminClient products={data.products} clicks={data.clicks} logoutAction={logoutAction} />
}
