from __future__ import annotations

from dataclasses import dataclass, field
from hashlib import md5
from typing import List, Optional, Tuple

from taj.orm.changes import Change, Replace, Subtract, Append, Delete


@dataclass
class Repo:
    """Class that represents a repository"""
    name: str
    description: str
    creator: str
    contributors: List[str]


@dataclass
class FileChange:
    """Represents a change to a file"""
    name: str
    changes: bytes
    is_full: bool  # True if the whole file was saved rather than only the changes


@dataclass
class Commit:
    """Represents a commit made by the user"""
    author: str
    message: str
    last_commit_hash: Optional[str]
    file_changes: List[FileChange]
    timestamp: int  # int(time.time())
    hash: str = field(init=False)
    idx: int = -1

    def __post_init__(self):
        self.hash = md5((f"{self.author}{self.message}{self.last_commit_hash}{self.timestamp}".encode())).hexdigest()


@dataclass
class CFSimplified:
    """A simplified CF implementation specific only for reading"""
    _changes: List[Change]
    current_len: int

    def apply(self, content: bytes, reverse: bool = False) -> bytes:
        """Applies the changes loaded onto the content, giving the new content from the previous or the opposite if reverse is True"""
        lst = list(content)
        changes = self._changes if not reverse else self._changes_reversed
        for change in changes:
            if isinstance(change, Replace):
                lst[change.index] = ord(change.value)
            elif isinstance(change, Subtract):
                del lst[change.index]
            elif isinstance(change, Append):
                lst.insert(change.index, ord(change.value))
            elif isinstance(change, Delete):
                raise FileNotFoundError("Delete Change")
        return b"".join([chr(val).encode() for val in lst])

    @classmethod
    def from_encoded(cls, encoded: bytes) -> CFSimplified:
        """Returns a CF object from encoded changes byte string"""
        a = cls(b"", b"")
        a._changes = parse_encoded(encoded)
        return a

    @property
    def _changes_reversed(self) -> List[Change]:
        """Returns the reversed operations needed to be performed"""
        return [val.reversed() for val in self._changes][::-1]


def parse_encoded(encoded: bytes) -> List[Change]:
    """Returns list of changes from encoded strings"""
    changes = []
    i = 0
    while i < len(encoded):
        if encoded[i] == ord(b"R"):
            value = chr(encoded[i + 1]).encode()
            prev = chr(encoded[i + 2]).encode()
            i += 2
            num, to_add = _parse_int(encoded, i)
            i += to_add
            changes.append(Replace(value, num, prev))
        elif encoded[i] in [ord(b"A"), ord(b"S")]:
            cls = Append if encoded[i] == ord(b"A") else Subtract
            val = chr(encoded[i + 1]).encode()
            i += 1
            num, to_add = _parse_int(encoded, i)
            i += to_add
            changes.append(cls(val, num))
        elif encoded[i] == ord(b"D"):
            changes.append(Delete())
        i += 1
    return changes


def _parse_int(encoded: bytes, start_i: int) -> Tuple[int, int]:
    """Returns a tuple with two ints, first one is the number that was parsed and the other how many times 'i' was incremented
    :raise ValueError"""
    i = start_i
    num = chr(encoded[i + 1]).encode()
    i += 1
    while i + 1 < len(encoded) and chr(encoded[i + 1]).encode() not in [b"A", b"S", b"R"]:
        num += chr(encoded[i + 1]).encode()
        i += 1
    if not num.decode().isdigit():
        raise ValueError(f"error at i={i}")
    return int(num), i - start_i
