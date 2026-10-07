-- Star Cinema booking database (PostgreSQL).
-- Run this once in your database's SQL editor (Supabase or Neon).

create table if not exists bookings (
  id            bigserial primary key,
  reference     text        not null unique,
  film          text        not null,
  day           text        not null,
  show_time     text        not null,
  screen        integer     not null,
  customer_name text        not null,
  email         text        not null,
  total_cents   integer     not null,
  created_at    timestamptz not null default now()
);

-- One row per booked seat. The UNIQUE rule below is what stops two people
-- booking the same seat: the database itself refuses the second one.
create table if not exists booking_seats (
  booking_id bigint  not null references bookings(id) on delete cascade,
  film       text    not null,
  day        text    not null,
  show_time  text    not null,
  screen     integer not null,
  seat       text    not null,
  unique (film, day, show_time, screen, seat)
);

create index if not exists booking_seats_booking_idx on booking_seats (booking_id);
