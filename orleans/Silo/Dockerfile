# Orleans Silo

# Restore, build & publish in temp build image
FROM mcr.microsoft.com/dotnet/core/sdk:3.1 as build
WORKDIR /src
COPY Silo ./Silo
COPY GrainModels ./GrainModels
COPY Grains ./Grains
COPY GrainInterfaces ./GrainInterfaces
WORKDIR /src/Silo
RUN dotnet restore
RUN dotnet publish --no-restore -c Release -o /app

# ---------------------------------------------

# Copy published binaries to final image
FROM mcr.microsoft.com/dotnet/core/runtime:3.1
WORKDIR /app
COPY --from=build /app .

ENV Orleans__ClusterId "smilr-default"
ENV Orleans__ServiceId "smilr"
ENV Orleans__LogLevel "3"

EXPOSE 11111
EXPOSE 30000

ENTRYPOINT [ "dotnet", "Silo.dll" ]
