all: zasm

clean: zasm-clean

zasm: zasm-clone zasm-build zasm-test

zasm-clone:
	git clone git@github.com:begoon/zasm.git 
	git clone git@github.com:begoon/Libraries.git 

zasm-build:
	$(MAKE) -C zasm

zasm-test:
	(cd zasm && rm -rf Test/ZXSP)
	(cd zasm && ./zasm --test)

zasm-clean:
	-rm -rf zasm Libraries
