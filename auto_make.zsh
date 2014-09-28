#!/usr/bin/env zsh

INOTIFY_OPT="--quiet --recursive --event modify --timefmt %H:%M:%S"

while inotifywait "${=INOTIFY_OPT}" --format "%T modified %f" .; do
    make
done

# Local Variables:
# coding: utf-8
# mode: sh
# tab-width: 4
# indent-tabs-mode: nil
# End:
