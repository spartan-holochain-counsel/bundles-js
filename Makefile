#
# Project
#
package-lock.json:	package.json
	npm install
	touch $@
node_modules:		package-lock.json
	npm install
	touch $@
build:			node_modules


#
# Testing
#
DEBUG_LEVEL	       ?= warn
TEST_ENV_VARS		= LOG_LEVEL=$(DEBUG_LEVEL)
MOCHA_OPTS		= -n enable-source-maps -t 5000

test:
	make -s test-unit

test-unit:			test-setup
	make -s test-unit-basic
	make -s test-unit-dna
	make -s test-unit-happ
	make -s test-unit-webhapp

test-unit-basic:		test-setup
	$(TEST_ENV_VARS) npx mocha $(MOCHA_OPTS) ./tests/unit/test_basic.js
test-unit-dna:			test-setup
	$(TEST_ENV_VARS) npx mocha $(MOCHA_OPTS) ./tests/unit/test_dna_bundle.js
test-unit-happ:			test-setup
	$(TEST_ENV_VARS) npx mocha $(MOCHA_OPTS) ./tests/unit/test_happ_bundle.js
test-unit-webhapp:		test-setup
	$(TEST_ENV_VARS) npx mocha $(MOCHA_OPTS) ./tests/unit/test_webhapp_bundle.js

test-setup:		tests/fake_zome_1.wasm	\
			tests/fake_zome_2.wasm	\
			tests/fake_zome_3.wasm	\
			tests/fake_zome_4.wasm	\
			tests/fake_dna_1.dna	\
			tests/fake_happ_1.happ	\
			tests/fake_gui_1.zip	\
			tests/fake_webhapp_1.webhapp
tests/fake_zome_%.wasm:
	dd if=/dev/zero of=$@ bs=1M count=5
tests/fake_dna_%.dna:		tests/dna_%/dna.yaml
	hc dna pack -o $@ tests/dna_$*
tests/fake_happ_%.happ:		tests/happ_%/happ.yaml
	hc app pack -o $@ tests/happ_$*
tests/fake_gui_%.zip:
	dd if=/dev/zero of=$@ bs=1M count=5
tests/fake_webhapp_%.webhapp:	tests/webhapp_%/web-happ.yaml
	hc web-app pack -o $@ tests/webhapp_$*



#
# Repository
#
clean-remove-chaff:
	@find . -name '*~' -exec rm {} \;
clean-files:		clean-remove-chaff
	git clean -nd
clean-files-force:	clean-remove-chaff
	git clean -fd
clean-files-all:	clean-remove-chaff
	git clean -ndx
clean-files-all-force:	clean-remove-chaff
	git clean -fdx


#
# NPM packaging
#
prepare-package:
	rm -f dist/*
	npx webpack
	MODE=production npx webpack
	gzip -kf dist/*.js
preview-package:	clean-files test prepare-package
	npm pack --dry-run .
create-package:		clean-files test prepare-package
	npm pack .
publish-package:	clean-files test prepare-package
	npm publish --access public .
