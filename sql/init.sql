create extension pgcrypto;

-- user

create table public."user"
(
    id uuid default gen_random_uuid() not null
        constraint user_pk
            primary key,
    username text not null,
    password text not null,
    admin boolean default false not null,
    filter boolean default true not null
);

alter table public."user" owner to gallery;

create unique index user_id_uindex
    on public."user" (id);

create unique index user_username_uindex
    on public."user" (username);

-- session

create table public.session
(
    id uuid default gen_random_uuid() not null
        constraint session_pk
            primary key,
    "user" uuid not null
        constraint session_user_id_fk
            references public."user"
            on update cascade on delete cascade,
    key text not null
);

alter table public.session owner to gallery;

create unique index session_id_uindex
    on public.session (id);

create unique index session_key_uindex
    on public.session (key);

-- photo

create table public.photo
(
    id uuid default gen_random_uuid() not null
        constraint photo_pk
            primary key,
    hash text not null,
    date_create timestamp not null,
    date_import timestamp default now() not null,
    censored boolean default true not null,
    thumbnail bytea not null,
    preview bytea not null
);

alter table public.photo owner to gallery;

create unique index photo_id_uindex
    on public.photo (id);

create unique index photo_hash_uindex
    on public.photo (hash);

-- tag

create table public.tag
(
    id uuid default gen_random_uuid() not null
        constraint tag_pk
            primary key,
    name text not null
);

alter table public.tag owner to gallery;

create unique index tag_id_uindex
    on public.tag (id);

create unique index tag_name_uindex
    on public.tag (name);

-- label

create table public.label
(
    id uuid default gen_random_uuid() not null
        constraint label_pk
            primary key,
    photo uuid not null
        constraint label_photo_id_fk
            references public.photo
            on update cascade on delete cascade,
    tag uuid not null
        constraint label_tag_id_fk
            references public.tag
            on update cascade on delete cascade
);

alter table public.label owner to gallery;

create unique index label_id_uindex
    on public.label (id);

