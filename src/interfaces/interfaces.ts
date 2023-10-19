import { QueryResult } from "pg";
interface iDeveloper {
  name: string;
  email: string;
}

interface iDeveloperId extends iDeveloper {
  id?: number;
}

interface iDeveloperInfo {
  developerSince: string;
  preferredOS: string;
}

interface iProjects {
  id: number;
  name: string;
  description: string;
  estimatedTime: string;
  repository: string;
  startDate: string;
  endDate: string;
  developerId: number;
}

interface iTechnology {
  id: string;
  technologyName: string;
}

type iDeveloperResult = QueryResult<iDeveloper>;

type iDeveloperInfoResult = QueryResult<iDeveloperInfo>;

type iProjectsResult = QueryResult<iProjects>;

type iTechnologyResult = QueryResult<iTechnology>;

type ListRequiredKeys = "name" | "email";

type ListRequiredKeysData =
  | "name"
  | "description"
  | "estimatedTime"
  | "repository"
  | "startDate"
  | "developerId";

export {
  iDeveloper,
  iDeveloperResult,
  ListRequiredKeys,
  iDeveloperInfo,
  iDeveloperInfoResult,
  ListRequiredKeysData,
  iProjects,
  iProjectsResult,
  iTechnologyResult,
  iDeveloperId,
  iTechnology,
};
