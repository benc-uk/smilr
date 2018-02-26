# Restore, build & publish
FROM microsoft/aspnetcore-build:2.0 AS build
WORKDIR /src
COPY . .
WORKDIR /src/Silo
RUN dotnet restore
RUN dotnet publish -c Release -o /app

FROM microsoft/aspnetcore:2.0
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "Silo.dll"]
