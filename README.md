# docker-node-browsertests

Dockerfile for Chrome Browsertests in a Docker-Container

## Usage

The Docker image is meant to run browser-tests (using newest chrome) in headless mode. See `docker-compose.yml` for an example usage. There you can specify environment variables for the tests and dependencies, like a database.

## Running the example

-   clone the repository
-   install [docker](https://docs.docker.com/get-docker/) and [docker-compose](https://docs.docker.com/compose/install/)
-   start docker
-   launch the task `example`
