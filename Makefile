ASM := npx --yes asm8080

all: build test

build:
	$(ASM) monitor.asm --split -o .

test:
	xxd original/mon32.bin >mon32.bin.hex
	xxd F800-FFFF.bin >monitor.bin.hex
	diff mon32.bin.hex monitor.bin.hex

clean:
	-rm -f mon32.bin.hex monitor.bin.hex F800-FFFF.bin
