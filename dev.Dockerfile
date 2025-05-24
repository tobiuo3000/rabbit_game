FROM python:3.12-slim-bookworm

RUN apt-get update \
    && apt-get install -y curl gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
    && apt-get install -y nodejs \
    && apt-get install -y git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir uv
WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv pip compile --no-emit-index-url --no-strip-extras pyproject.toml -o requirements.txt \
    && uv pip install --system --no-deps -r requirements.txt

COPY package.json package-lock.json* ./
RUN if [ -f package.json ]; then npm install; fi

VOLUME ["/app"]
COPY . .

RUN npx webpack

EXPOSE 8000
CMD ["python", "app.py"]