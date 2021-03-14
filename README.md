![](https://github.com/begoon/rk86-monitor/actions/workflows/test.yaml/badge.svg)

# Оригинальный Монитор Радио-86РК

Данный проект - это оригинальный Монитор от РК, используемый в эмуляторе
[rk86.ru](https://rk86.ru).

Смысл проекта не менять код, а максимально покрыть его комментариями.

Система сборки компилирует asm-файл и сравнивает результат с файлом "mon32.bin",
чтобы убедиться в идентичности.

Сборка и проверка запускается командой `make`.

Для компиляции требуется [zasm](https://k1.spdns.de/Develop/Projects/zasm/Distributions/).

## Как собрать zasm

Проверялось на Mac.

    cd your/development/folder
    git clone git@github.com:Megatokio/zasm.git
    git clone git@github.com:Megatokio/Libraries.git
    cd zasm
    make
    ./zasm

Должно вывести что-то вроде:

    zasm - 8080/z80/z180 assembler (c) 1994 - 2021 Günter Woigk.
    version 4.4.8, 2021-03-09, for Unix-MacOSX.
