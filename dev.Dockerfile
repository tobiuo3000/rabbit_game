FROM python:3.12-slim-bookworm

RUN apt-get update \
    && apt-get install -y curl gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir uv
WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv pip install --system --no-deps -r <(uv pip compile --no-emit-index-url --no-strip-extras pyproject.toml)

COPY package.json package-lock.json* ./
RUN if [ -f package.json ]; then npm install; fi

VOLUME ["/app"]
COPY . .

EXPOSE 8000
CMD ["python", "app.py"]