export interface ITable {
  number: string;
  status: TableStatus;
  capacity: number;
  location: "indoor" | "outdoor";
}

export interface ITableParams {
  page: number;
  limit: number;
  date:string
  time:string
}

export enum TableStatus {
  AVAILABLE = "available",
  RESERVED = "reserved",
  SEATED = "seated",
  CLEANING = "cleaning",
}