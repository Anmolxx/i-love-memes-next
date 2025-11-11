Dockerization notes for ilove-memes

Files added/updated:
- Dockerfile: production-ready multi-stage build (Node 22, non-root user, healthcheck)
- .dockerignore: avoid copying node_modules and build output
- docker-compose.dev.yml: local development with hot-reload

Build production image:

```bash
# From project root (Windows cmd.exe)
# Build image (uses Node 22 base images)
docker build -t ilovememes:prod .
```

Run production container:

```bash
# Run container and map port 3000
docker run -p 3000:3000 ilovememes:prod
```

Run development with docker-compose (hot-reload):

```bash
# Start dev container with bind-mounts (Windows cmd.exe)
docker compose -f docker-compose.yml up --build
```

Production recommendations:
- This Dockerfile uses Node 22 (bullseye-slim). If you prefer smaller images, consider switching to an alpine base and installing required build tools.
- For a leaner runtime, you can enable Next.js standalone output (set "output": "standalone" in next.config.js) and copy the generated `standalone` folder into the runtime stage instead of `.next`.
- If your app requires environment variables, pass them via `-e KEY=VALUE` or use a secret manager.
- If you use native libraries (sharp, etc.), ensure build tools are available in the deps stage.
