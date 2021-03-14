ifeq ($(ZASM),)
ZASM := zasm
endif

all: build test

build:
	$(ZASM) --asm8080 --opcodes --labels monitor.asm

test:
	xxd original/mon32.bin >mon32.bin.hex
	xxd monitor.rom >monitor.rom.hex
	diff mon32.bin.hex monitor.rom.hex

clean:
	$(MAKE) -C tools clean
	-rm -f monitor.rom monitor.rom
	-rm -f mon32.bin.hex monitor.rom.hex

ci: ci-build-tools ci-test

ci-build-tools:
	$(MAKE) -C tools

ci-test:
	$(MAKE) ZASM=tools/zasm/zasm all
