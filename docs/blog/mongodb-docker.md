---
title: "MongoDB in Docker: Compose, Auth and a Healthcheck"
titleTemplate: false
description: "Run MongoDB in Docker for a self-hosted app: a compose file with a root user, a named volume and a healthcheck, the authSource connection string and backups."
headline: "Run MongoDB in Docker for a self-hosted app"
date: "2026-11-28"
keyword: "mongodb docker"
faq: [{"q": "How do I run MongoDB in Docker?", "a": "Use the official mongo image with a named volume at /data/db, for example in a docker compose service, and set MONGO_INITDB_ROOT_USERNAME and MONGO_INITDB_ROOT_PASSWORD to create an admin user on first start."}, {"q": "Why does MongoDB say Authentication failed in Docker?", "a": "The root user from MONGO_INITDB_ROOT_USERNAME lives in the admin database. Add authSource=admin to the connection string when you connect to another database with it."}, {"q": "Do the MONGO_INITDB variables change an existing database?", "a": "No. The image only runs its init step when the data directory is empty. With an existing volume the variables are ignored."}]
---

# Run MongoDB in Docker for a self-hosted app

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">Many self-hosted tools need a MongoDB server, and Docker is the easiest way to give them one that survives restarts and updates. This is a compose file that was run and tested for this post, the connection string that goes with it, and the mistakes that cause most "Authentication failed" errors.</p>

## The compose file

```yaml
services:
  mongo:
    image: mongo:7
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: supadomain
      MONGO_INITDB_ROOT_PASSWORD: change-me
    ports:
      - "127.0.0.1:27017:27017"
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand('ping').ok"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 20s

volumes:
  mongo_data:
```

Start it with `docker compose up -d`. What each part does, per the [official image's documentation](https://hub.docker.com/_/mongo):

- **`image: mongo:7`** pins the major version. Pin a major rather than `latest`, because MongoDB upgrades between majors have to go one release at a time, and a server two majors newer will not start on the old data files. The test for this post ran `mongo:7`, which reported `db version v7.0.48`.
- **`MONGO_INITDB_ROOT_USERNAME` and `_PASSWORD`** create a root user in the `admin` database and turn on authentication. Without them, the server accepts anyone who can reach the port.
- **`127.0.0.1:27017:27017`** publishes the port on the host's loopback only. An app on the same host can connect; the internet cannot. If the app runs in the same compose file, drop `ports` entirely and use the service name as the host.
- **`mongo_data:/data/db`** keeps the database in a named volume, so `docker compose down` and image updates do not delete it.
- **The healthcheck** runs `mongosh` inside the container. `ping` works without credentials, so the check needs no password in the file.

## The connection string

For an app on the host:

```bash
MONGODB_URI="mongodb://supadomain:change-me@localhost:27017/supadomain?authSource=admin"
```

`authSource=admin` matters. The root user lives in `admin`, and without the parameter the driver tries to log in to the database in the path. In the test, the same command with and without it, run with the `mongosh` that ships in the image, gave:

```text
$ docker compose exec mongo mongosh --quiet \
    "mongodb://supadomain:change-me@localhost:27017/supadomain?authSource=admin" --eval 'db.getName()'
supadomain
$ docker compose exec mongo mongosh --quiet \
    "mongodb://supadomain:change-me@localhost:27017/supadomain" --eval 'db.getName()'
MongoServerError: Authentication failed.
```

The `supadomain` database did not exist beforehand; MongoDB creates a database on the first write. If the password contains `@`, `:` or `/`, percent-encode it in the URI.

## Start-up order

On a fresh volume the image starts a temporary server, creates the user, then restarts into the real one. In the test, the healthcheck already reported `healthy` during that first phase, and a connection made right then was refused; a second try a few seconds later worked. With `depends_on: { mongo: { condition: service_healthy } }` an app can still start a moment too early on the very first boot, so let it retry its database connection instead of exiting.

## Common errors

| Error | Usual cause |
| --- | --- |
| `Authentication failed` | Missing `authSource=admin`, or the volume was created earlier with another password. |
| Changed the password variable, old password still works | The init step only runs on an empty data directory. Change the password with `db.changeUserPassword()` in `mongosh`, or start over with a new volume. |
| `ECONNREFUSED 127.0.0.1:27017` from another container | Inside a container, `localhost` is the container itself. Use the service name, such as `mongo:27017`. |
| Data gone after `docker compose down -v` | `-v` removes named volumes. Leave it off. |

## Backups

`mongodump` ships in the image. To write an archive to the host:

```bash
docker compose exec -T mongo mongodump \
  --uri "mongodb://supadomain:change-me@localhost:27017/?authSource=admin" \
  --archive --gzip > mongo-$(date +%F).archive.gz
```

Restore with `mongorestore --archive --gzip` the same way, reading the file from stdin. Both directions were run for this post: one test document went out and came back. Copy the archive off the machine; a backup on the same disk does not help when the disk fails.

## Using it with Supadomain

[Supadomain](/) keeps everything in MongoDB: domains, dates from RDAP, the Slack webhook URL and the admin account. The [getting started guide](/guide/getting-started) asks for a reachable MongoDB and a `MONGODB_URI` in `.env`; the compose file above provides both. The [configuration reference](/guide/configuration#what-is-stored-in-mongodb) lists what is stored, which is also what your backup contains, including the webhook URL in plain text.

## FAQ

### How do I run MongoDB in Docker?

Use the official mongo image with a named volume at /data/db, for example in a docker compose service, and set MONGO_INITDB_ROOT_USERNAME and MONGO_INITDB_ROOT_PASSWORD to create an admin user on first start.

### Why does MongoDB say Authentication failed in Docker?

The root user from MONGO_INITDB_ROOT_USERNAME lives in the admin database. Add authSource=admin to the connection string when you connect to another database with it.

### Do the MONGO_INITDB variables change an existing database?

No. The image only runs its init step when the data directory is empty. With an existing volume the variables are ignored.

## Related posts

- [How to get a Slack webhook URL](/blog/slack-webhook-url)
- [A free WHOIS API: query RDAP as JSON](/blog/whois-api)
- [Domain status codes: clientTransferProhibited and the rest](/blog/domain-status-codes)
- [All posts](/blog/)
