# ---- Stage 1: build the native C engine -----------------------------------
FROM debian:bookworm-slim AS native-builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    cmake build-essential pkg-config \
    libjpeg62-turbo-dev libpng-dev libssl-dev libqrencode-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /native_engine
COPY native_engine/ .
RUN mkdir -p build && cd build && cmake .. && make -j"$(nproc)"

# ---- Stage 2: Python application -------------------------------------------
FROM python:3.12-slim AS app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=config.settings.prod

RUN apt-get update && apt-get install -y --no-install-recommends \
    libjpeg62-turbo libpng16-16 libssl3 libqrencode4 libpq5 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements/ requirements/
RUN pip install --no-cache-dir -r requirements/base.txt

COPY . .
COPY --from=native-builder /native_engine/build/libresq_native.so /app/native_engine/build/libresq_native.so

RUN useradd --create-home --uid 1000 resq && chown -R resq:resq /app
USER resq

RUN python manage.py collectstatic --noinput --settings=config.settings.prod || true

EXPOSE 8000

CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "config.asgi:application"]
