FROM redis:latest
COPY redis.conf /usr/local/etc/redis/redis.conf
# CMD [ "redis-server", "--requirepass", "123456"]