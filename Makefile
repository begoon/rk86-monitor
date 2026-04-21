ASM := bunx --bun asm8080@latest

all: build test

build:
	$(ASM) monitor.asm --split -o .

listing:
	$(ASM) -l monitor.asm

test:
	xxd original/mon32.bin >mon32.bin.hex
	xxd F800-FFFF.bin >monitor.bin.hex
	diff mon32.bin.hex monitor.bin.hex

docs: listing
	cd ui && bun install --frozen-lockfile 2>/dev/null || (cd ui && bun install)
	cd ui && bun run build

clean:
	-rm -f mon32.bin.hex monitor.bin.hex F800-FFFF.bin
	-rm -rf docs ui/node_modules
