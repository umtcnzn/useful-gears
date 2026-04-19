create table if not exists login_attempts (
  ip            text primary key,
  count         int default 1,
  blocked_until timestamptz,
  last_attempt  timestamptz default now()
);

alter table login_attempts enable row level security;

-- Only server-side service role can read/write this table
create policy "Service role only"
  on login_attempts
  using (false);
