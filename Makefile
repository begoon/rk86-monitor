all: build test

build:
	zasm --asm8080 --opcodes --labels monitor.asm

test:
	diff original/mon32.bin monitor.rom

diff:
	xxd original/mon32.bin >mon32.bin.hex
	xxd monitor.rom >monitor.rom.hex
	diff mon32.bin.hex monitor.rom.hex

clean:
	-rm -f monitor.rom monitor.rom
	-rm -f mon32.bin.hex monitor.rom.hex
