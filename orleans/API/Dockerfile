# Restore, build & publish in temp build image
FROM mcr.microsoft.com/dotnet/core/sdk:2.2 as build
WORKDIR /src
COPY . .
WORKDIR /src/API
RUN dotnet restore
RUN dotnet publish -c Release -o /app

# ---------------------------------------------

# Copy published binaries to final image
FROM mcr.microsoft.com/dotnet/core/aspnet:2.2
WORKDIR /app
COPY --from=build /app .

ENV Orleans__ClusterId "smilrcluster"
ENV Orleans__ServiceId "smilr"

ENTRYPOINT [ "dotnet", "API.dll" ]
