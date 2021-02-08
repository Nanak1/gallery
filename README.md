# Gallery

Gallery Web Application for manage media in Nextcloud

## DB

Example for Docker:

```shell script
docker run \
  --name gallery_db \
  --restart=always \
  -p 5555:5432 \
  -v gallery_db:/var/lib/postgresql/data \
  -e POSTGRES_DB=gallery \
  -e POSTGRES_USER=gallery \
  -e POSTGRES_PASSWORD=gallery \
  -d postgres
```

Add user:

```postgresql
INSERT INTO "user" (id, username, password, admin, censored) 
VALUES ('00000000-0000-0000-0000-000000000000', 'admin', encode(digest('admin', 'sha512'), 'hex'), true, false);
```

## Config

Add `config.json` to root directory:

```json
{
  "http": {
    "port": 3333,
    "uploadFileSize": "1024 * 1024 * 256",
    "jsonLimit": "256MB"
  },
  "session": {
    "key": "gallery_session_key",
    "maxAge": "1000 * 60 * 60 * 24 * 365"
  },
  "db": {
    "gallery": {
      "host": "localhost",
      "port": 5555,
      "database": "gallery",
      "user": "gallery",
      "password": "gallery"
    }
  }
}
```

## Nextcloud

```shell script
docker exec --user www-data nextcloud_app php occ files:scan --all --verbose
```