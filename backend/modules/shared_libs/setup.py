import codecs
import os.path

from setuptools import find_packages, setup

HERE = os.path.abspath(os.path.dirname(__file__))


def read(rel_path):
    with codecs.open(os.path.join(HERE, rel_path), "r") as fp:
        return fp.read()


def get_version(rel_path):
    for line in read(rel_path).splitlines():
        print(f"line > ${line}")
        if line.startswith("__version__"):
            delim = '"' if '"' in line else "'"
            return line.split(delim)[1]
    else:
        raise RuntimeError("Unable to find version string.")


# This stripped-down demo intentionally has a single project-level
# README rather than one per internal package, so fall back to an
# empty long_description if README.md isn't present here.
if os.path.exists(os.path.join(HERE, "README.md")):
    with open("README.md", encoding="utf-8") as fh:
        long_description = fh.read()
else:
    long_description = ""

setup(
    include_package_data=True,
    long_description_content_type="text/markdown",
    long_description=long_description,
    package_dir={"": "src"},
    packages=find_packages(where="src"),
    version=get_version("src/shared_libs/__init__.py"),
)
