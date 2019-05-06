# -------------------------------------------------------------------------------------------------
FROM klakegg/hugo:latest as site-builder

COPY site /src
RUN hugo --destination=/onbuild

FROM eu.gcr.io/kramergroup/tutorial-frontend 
COPY --from=site-builder /onbuild /app/public

