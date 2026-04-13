# Radio-86RK Monitor ROM Disassembly

## Project

Disassembled and annotated listing of the 2KB monitor ROM for the Radio-86RK (Радио-86РК) — a Soviet homebrew computer based on the Intel 8080 CPU. The monitor provides basic I/O, memory operations, tape storage, and a simple command-line interface.

## Key files

- `monitor.asm` — the main annotated listing (Russian comments), assembles to a binary identical to the original ROM
- `original/mon32.bin` — the original ROM binary (2048 bytes, reference)
- `alt/MonitorRK16.txt` — alternative disassembly source (2500 A.D. assembler syntax, kept for reference)

## Build

```
make          # assemble + verify against original ROM
make build    # assemble only
make test     # compare output with original/mon32.bin
make clean
```

Assembler: `asm8080` from npm (`npx --yes asm8080`). Requires Node.js.

The assembler supports expressions: `+`, `-`, `*`, `/`, `%`, `|`, `&`, `^`, `~`, `<<`, `>>`, `()`, `LOW()`, `HIGH()`.

## Conventions

- Comments are in Russian
- Hardware register constants (equ) are UPPER_CASE (e.g., `PORT_A_KBD`, `CONTROL_VG75`)
- Memory variable names are lower_case (e.g., `cursor_addr`, `ruslat_flag`)
- Code labels are lower_case (e.g., `entry_start`, `run_D_command`)
- Every code label has an address comment: `label_name:  ; F800`
- Every equ variable has a precomputed address: `cursor_addr equ monitor_area+0 ; 7600h - ...`
- The assembled binary MUST be byte-for-byte identical to `original/mon32.bin` — always run `make test` after changes

## CI

GitHub Actions (`.github/workflows/test.yaml`) runs `make` on push — assembles and diffs against the original binary.
