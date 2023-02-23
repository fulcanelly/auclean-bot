TAG := $(notdir $(shell pwd))

run-docker = docker run -it --name='${TAG}' ${1} '${TAG}'

.PHONY: all
all: build

.PHONY: build
build: Dockerfile
	docker build -t '${TAG}' .

.PHONY: run
run: build
	$(call run-docker,--rm)

.PHONY: daemon
daemon: build
	$(call run-docker,--restart=always -d)

.PHONY: stop-daemon
stop-daemon:
	@ set -xue \
	; for action in stop rm \
	; do docker "$${action}" '${TAG}' \
	; done

