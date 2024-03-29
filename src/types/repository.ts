export interface RepoOwner {
  login: string;
  avatar_url: string;
  url: string;
}

export interface RepoItem {
  id: number;
  node_id: string;
  name: string;
  description: string;
  url: string;
  size: number;
  open_issues_count: number;
  forks_count: number;
  forks: number;
  topics: string[];
  full_name: string;
  private: boolean;
  owner: RepoOwner;
}

export interface GetSearchRepoResponse {
  total_count: number;
  incomplete_results: boolean;
  items: RepoItem[];
}
