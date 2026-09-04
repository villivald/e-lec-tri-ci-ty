FROM postgres:16.15-bookworm

LABEL org.opencontainers.image.title="Electricity Data PostgreSQL"
LABEL org.opencontainers.image.description="PostgreSQL with the electricity dataset"

ADD assignment/init-db.tar.gz /docker-entrypoint-initdb.d/
