from setuptools import setup, find_packages

setup(
    name="sentinel-sdk",
    version="0.1.0",
    packages=find_packages(),
    python_requires=">=3.11",
    install_requires=[
        "httpx>=0.26.0",
        "websockets>=12.0",
        "cryptography>=42.0.0",
    ],
)
