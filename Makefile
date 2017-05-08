# CodeGradXenroll

work : lint nsp+snyk tests
clean :
	-rm *~
	-rm README.log README.tex

# ############## Working rules:

lint :
	jshint codegradxenroll.js

nsp+snyk :
	npm link nsp
	node_modules/.bin/nsp check
	npm link snyk
	-node_modules/.bin/snyk test codegradxenroll

tests : 
	@echo " tests require a running vmauthor..."
	ping -c 3 xvmauthor.codegradx.org
	jasmine 2>&1 | tee /tmp/spec.log
	@echo "*** Report with         less /tmp/spec.log"

# ############## NPM package
# Caution: npm takes the whole directory that is . and not the sole
# content of CodeGradXenroll.tgz 

publish : lint nsp+snyk bower.json clean
	-rm -rf node_modules/codegradx*
	npm install -S codegradxlib
	git status .
	-git commit -m "NPM publication `date`" .
	git push
	-rm -f CodeGradXenroll.tgz
	m CodeGradXenroll.tgz install
	cd tmp/CodeGradXenroll/ && npm version patch && npm publish
	cp -pf tmp/CodeGradXenroll/package.json .
	rm -rf tmp
	npm install -g codegradxenroll

CodeGradXenroll.tgz :
	-rm -rf tmp
	mkdir -p tmp
	cd tmp/ && git clone https://github.com/ChristianQueinnec/CodeGradXenroll.git
	rm -rf tmp/CodeGradXenroll/.git
	cp -p package.json tmp/CodeGradXenroll/ 
	tar czf CodeGradXenroll.tgz -C tmp CodeGradXenroll
	tar tzf CodeGradXenroll.tgz

REMOTE	=	www.paracamplus.com
install : CodeGradXenroll.tgz
	rsync -avu CodeGradXenroll.tgz \
		${REMOTE}:/var/www/www.paracamplus.com/Resources/Javascript/
	npm install -g codegradxenroll

# ############## bower

bower.json : package.json
	node npm2bower.js

bower.registration :
	node_modules/.bin/bower register codegradxenroll https://github.com/ChristianQueinnec/CodeGradXenroll.git

# ############## Various experiments (not all finished)

README.tex : README.md
	pandoc -o README.tex -f markdown README.md 
README.pdf : README.tex
	pandoc -o README.pdf -f markdown README.md 

doc : doc/index.html
doc/index.html : codegradxenroll.js
	node_modules/.bin/jsdoc -c conf.json codegradxenroll.js

docco :
	docco codegradxenroll.js

browserify :
	browserify codegradxenroll.js -o codegradxenroll-bundle.js

uglifyjs :
	uglifyjs codegradx.js -c "evaluate=false" \
		-m --source-map codegradx.min.map -o codegradx.min.js

phantomjs :
	phantomjs test/run-jasmine.js test/jasmine.html

# end of Makefile
