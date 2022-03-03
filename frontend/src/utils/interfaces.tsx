export interface Repo {
  name: string;
  description: string;
  creator: string;
  contributors: string[];
  commits: Commit[];
}

export interface RepoFile {
  binary: boolean;
  commit: Commit;
  content: string;
  name: string;
  type: "file" | "dir";
}

export interface Commit {
  author: string;
  file_changes: Array<any>;
  hash: string;
  idx: number;
  last_commit_hash: string | null;
  message: string;
  timestamp: number;
}

export interface FileMetadata {
  binary: boolean;
  content: string;
  lines: number;
  size: number;
}

export interface SearchReasults {
  repos: Repo[];
  users: string[];
}
