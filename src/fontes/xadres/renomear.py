import hashlib
import shutil
from random import randint
import json
import math
from pathlib import Path
import re
import os
import glob
from os.path import dirname
import threading


def hasFile(fname):
    BLOCKSIZE = 65536
    fname = Path(fname)
    hasher = hashlib.sha512()

    with open(fname.absolute(), "rb") as f:
        buf = f.read(BLOCKSIZE)

        while len(buf) > 0:
            hasher.update(buf)
            buf = f.read(BLOCKSIZE)

        f.close()

        return hasher.hexdigest()


def mover(fname, folder, bkFolder):
    Path(bkFolder).mkdir(parents=True, exist_ok=True)

    path = fname.resolve().as_posix().replace(
        folder.resolve().as_posix(), "")
    novo = Path(bkFolder.resolve().as_posix()+"/"+path)

    Path(dirname(novo.resolve().as_posix())).mkdir(parents=True, exist_ok=True)

    print(folder.resolve().as_posix(), ":",
          fname.resolve().as_posix(), "=>", novo.resolve().as_posix())

    shutil.move(fname.resolve().as_posix(), novo.resolve().as_posix())


def runFolder(folder):
    folder = Path(folder)

    for fname in folder.iterdir():
        r = re.search("^(.+\.)(\d+)$", fname.stem, re.IGNORECASE)

        if (r):
            g = int(r.group(2))

            if (g == 16):
                g = int(round(math.sqrt(g)))
                n = r.group(1) + str(g) + ".json"
                print(fname.stem, "=>", n)
                os.rename(fname.stem + ".json", n)


runFolder("")
