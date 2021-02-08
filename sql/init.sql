create extension pgcrypto;

-- user

create table "user"
(
    id uuid default gen_random_uuid() not null
        constraint user_pk
            primary key,
    username text not null,
    password text not null,
    admin boolean default false not null,
    censored boolean default true not null
);

alter table "user" owner to gallery;

create unique index user_id_uindex
    on "user" (id);

create unique index user_username_uindex
    on "user" (username);

-- session

create table session
(
    id uuid default gen_random_uuid() not null
        constraint session_pk
            primary key,
    "user" uuid not null
        constraint session_user_id_fk
            references "user"
            on update cascade on delete cascade,
    key text not null
);

alter table session owner to gallery;

create unique index session_id_uindex
    on session (id);

create unique index session_key_uindex
    on session (key);

-- photo

create table photo
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

alter table photo owner to gallery;

create unique index photo_id_uindex
    on photo (id);

create unique index photo_hash_uindex
    on photo (hash);

-- tag

create table tag
(
    id uuid default gen_random_uuid() not null
        constraint tag_pk
            primary key,
    name text not null
);

alter table tag owner to gallery;

create unique index tag_id_uindex
    on tag (id);

create unique index tag_name_uindex
    on tag (name);

-- label

create table label
(
    id uuid default gen_random_uuid() not null
        constraint label_pk
            primary key,
    photo uuid not null
        constraint label_photo_id_fk
            references photo
            on update cascade on delete cascade,
    tag uuid not null
        constraint label_tag_id_fk
            references tag
            on update cascade on delete cascade
);

alter table label owner to gallery;

create unique index label_id_uindex
    on label (id);