install:
	npm install

publish:
	npm publish

lint:
	npx eslint .

develop:
	npx webpack-dev-server

build:
	rm -rf dist
	NODE_ENV=production npx webpack

start:
	npm run-script start-server