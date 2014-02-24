BROWSERIFY = node_modules/.bin/browserify
SHADERS = $(shell find shaders -type f -name '*.glsl')

APPLICATION = \
	js/index.js

all: \
	dist/index.js

clean:
	rm -f dist/*

install:
	npm install && mkdir -p dist && make

dist/shaders.js: $(SHADERS)
	mkdir -p dist && ./bin/shaders.js

dist/index.js: $(APPLICATION) dist/shaders.js
	$(BROWSERIFY) js/index.js > dist/index.js

.PHONY: all clean install
