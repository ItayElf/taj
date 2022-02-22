from dataclasses import dataclass
from typing import List


@dataclass
class Repo:
    """Class that represents a repository"""
    name: str
    description: str
    creator: str
    contributors: List[str]
