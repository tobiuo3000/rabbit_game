FROM python:3.12-slim-bookworm AS dev

RUN apt-get update \
    && apt-get install -y curl gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
    && apt-get install -y git \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g typescript
RUN pip install --no-cache-dir uv
WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv pip compile --no-emit-index-url --no-strip-extras pyproject.toml -o requirements.txt \
    && uv pip install --system --no-deps -r requirements.txt

COPY package.json package-lock.json* ./
RUN if [ -f package.json ]; then npm install; fi

COPY . .

RUN npx tsc
RUN npx webpack

EXPOSE 5000

FROM python:3.12-slim-bookworm AS prod

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN pip install --no-cache-dir uv \
    && uv pip compile --no-emit-index-url --no-strip-extras pyproject.toml -o requirements.txt \
    && uv pip install --system --no-deps -r requirements.txt

COPY --from=dev /usr/bin/node /usr/bin/
COPY --from=dev /usr/lib/node_modules /usr/lib/node_modules
ENV PATH="/usr/lib/node_modules/typescript/bin:$PATH"

COPY --from=dev /app /app

EXPOSE 5000

CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]