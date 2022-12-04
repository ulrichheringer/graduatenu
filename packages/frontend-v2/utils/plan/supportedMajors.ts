import { GetSupportedMajorsResponse } from "@graduate/common";

export const extractSupportedMajorYears = (
  supportedMajorsData?: GetSupportedMajorsResponse
) => {
  return Object.keys(supportedMajorsData?.supportedMajors ?? {});
};
export const extractSupportedMajorNames = (
  catalogYear: number,
  supportedMajorsData?: GetSupportedMajorsResponse
): string[] => {
  return Object.keys(supportedMajorsData?.supportedMajors[catalogYear] ?? {});
};