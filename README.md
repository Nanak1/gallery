# Gallery

gallery web application for manage photo on nextcloud

# DB

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

# Config

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

# Nextcloud

```shell script
docker exec --user www-data nextcloud_app php occ files:scan --all --verbose
```