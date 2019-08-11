# Restore, build & publish in temp build image
FROM mcr.microsoft.com/dotnet/core/sdk:2.2 as build
WORKDIR /src
COPY API ./API
COPY GrainModels ./GrainModels
COPY GrainInterfaces ./GrainInterfaces
WORKDIR /src/API
RUN dotnet restore
RUN dotnet publish --no-restore -c Release -o /app

# ---------------------------------------------

# Copy published binaries to final image
FROM mcr.microsoft.com/dotnet/core/aspnet:2.2
WORKDIR /app
COPY --from=build /app .

ENV Orleans__ClusterId "smilr-default"
ENV Orleans__ServiceId "smilr"
ENV Orleans__LogLevel "3"

ENTRYPOINT [ "dotnet", "API.dll" ]
